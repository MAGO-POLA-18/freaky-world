import { NextResponse } from "next/server";

/* =========================================================
   CONFIG
========================================================= */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const STATE_ID = 1;

const DEFAULT_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 500;

/*
  Objetivo inicial de Tierra Vicio.

  Cuando queramos ampliar la biblioteca, por ejemplo a
  10.000 juegos, solamente cambiamos este valor.
*/
const TARGET_GAME_COUNT = 5000;

/* =========================================================
   ENVIRONMENT
========================================================= */

function getEnvironment() {
  const supabaseUrl =
    process.env.SUPABASE_URL?.replace(/\/+$/, "");

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta SUPABASE_URL.");
  }

  if (!supabaseSecret) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    supabaseUrl,
    supabaseSecret,
  };
}

/* =========================================================
   SUPABASE
========================================================= */

async function supabaseRequest(
  environment,
  path,
  options = {}
) {
  const response = await fetch(
    `${environment.supabaseUrl}/rest/v1/${path}`,
    {
      ...options,

      headers: {
        apikey: environment.supabaseSecret,

        Authorization:
          `Bearer ${environment.supabaseSecret}`,

        "Content-Type": "application/json",

        Prefer:
          options.prefer ||
          "return=representation",

        ...(options.headers || {}),
      },

      cache: "no-store",
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Supabase ${path} respondió ${response.status}: ${text}`
    );
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* =========================================================
   CONTAR JUEGOS REALES
========================================================= */

async function getGameCount(environment) {
  const response = await fetch(
    `${environment.supabaseUrl}/rest/v1/games?select=id`,
    {
      method: "HEAD",

      headers: {
        apikey: environment.supabaseSecret,

        Authorization:
          `Bearer ${environment.supabaseSecret}`,

        Prefer: "count=exact",
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `No se pudo contar games. Supabase respondió ${response.status}: ${text}`
    );
  }

  const contentRange =
    response.headers.get("content-range");

  if (!contentRange) {
    throw new Error(
      "Supabase no devolvió content-range al contar games."
    );
  }

  const match =
    contentRange.match(/\/(\d+)$/);

  if (!match) {
    throw new Error(
      `No se pudo interpretar el conteo de games: ${contentRange}`
    );
  }

  return Number(match[1]);
}

/* =========================================================
   STATE
========================================================= */

async function getImportState(environment) {
  const rows = await supabaseRequest(
    environment,
    `igdb_import_state?id=eq.${STATE_ID}&select=*`,
    {
      method: "GET",
    }
  );

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    throw new Error(
      "No existe el estado del importador IGDB."
    );
  }

  return rows[0];
}

async function updateImportState(
  environment,
  values
) {
  const payload = {
    ...values,
    updated_at: new Date().toISOString(),
  };

  const rows = await supabaseRequest(
    environment,
    `igdb_import_state?id=eq.${STATE_ID}`,
    {
      method: "PATCH",

      prefer: "return=representation",

      body: JSON.stringify(payload),
    }
  );

  return Array.isArray(rows)
    ? rows[0]
    : rows;
}

/* =========================================================
   HELPERS
========================================================= */

function clampBatchSize(value) {
  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1
  ) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(
    parsed,
    MAX_BATCH_SIZE
  );
}

function getBaseUrl(request) {
  return new URL(request.url).origin;
}

function jsonResponse(
  data,
  status = 200
) {
  return NextResponse.json(data, {
    status,

    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
    },
  });
}

/* =========================================================
   INFORMACIÓN DEL OBJETIVO
========================================================= */

function buildTargetInfo(gameCount) {
  return {
    target: TARGET_GAME_COUNT,

    current: gameCount,

    remaining: Math.max(
      0,
      TARGET_GAME_COUNT - gameCount
    ),

    reached:
      gameCount >= TARGET_GAME_COUNT,
  };
}

/* =========================================================
   LLAMAR AL IMPORTADOR REAL
========================================================= */

async function runBulkBatch({
  request,
  after,
  limit,
}) {
  const baseUrl = getBaseUrl(request);

  const url =
    `${baseUrl}/api/igdb/sync` +
    `?mode=bulk` +
    `&after=${after}` +
    `&limit=${limit}`;

  const response = await fetch(url, {
    method: "GET",

    headers: {
      "Cache-Control": "no-cache",
    },

    cache: "no-store",
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `El importador devolvió una respuesta inválida: ${text.slice(
        0,
        500
      )}`
    );
  }

  if (
    !response.ok ||
    !data?.ok
  ) {
    throw new Error(
      data?.error ||
      `El lote IGDB falló con HTTP ${response.status}.`
    );
  }

  return data;
}

/* =========================================================
   EJECUTAR UN LOTE AUTOMÁTICO
========================================================= */

async function executeAutomaticBatch(
  request
) {
  const environment =
    getEnvironment();

  const state =
    await getImportState(environment);

  /*
    Contamos la biblioteca REAL antes de importar.
  */

  const gameCountBefore =
    await getGameCount(environment);

  const targetBefore =
    buildTargetInfo(gameCountBefore);

  /*
    Si ya tenemos 5.000 o más, no tocamos IGDB.
  */

  if (targetBefore.reached) {
    const savedState =
      await updateImportState(
        environment,
        {
          status: "target-reached",
          last_error: null,
        }
      );

    return {
      ok: true,

      action: "target-reached",

      message:
        `Objetivo alcanzado: ${gameCountBefore} juegos en la biblioteca.`,

      target: targetBefore,

      state: savedState,
    };
  }

  /*
    Si IGDB realmente terminó, tampoco seguimos.
  */

  if (state.status === "finished") {
    return {
      ok: true,

      action: "nothing-to-do",

      message:
        "IGDB ya no devolvió más juegos para importar.",

      target: targetBefore,

      state,
    };
  }

  /*
    Pausa manual.
  */

  if (state.status === "paused") {
    return {
      ok: true,

      action: "paused",

      message:
        "El importador está pausado.",

      target: targetBefore,

      state,
    };
  }

  /*
    target-reached significa que habíamos llegado al
    objetivo configurado anteriormente.

    Si posteriormente aumentamos TARGET_GAME_COUNT,
    permitimos continuar automáticamente.
  */

  if (
    state.status === "target-reached" &&
    !targetBefore.reached
  ) {
    await updateImportState(
      environment,
      {
        status: "running",
        last_error: null,
      }
    );
  }

  const after =
    Number(state.cursor_after || 0);

  const configuredBatchSize =
    clampBatchSize(state.batch_size);

  /*
    Nunca pedimos más juegos de los que faltan para
    alcanzar el objetivo.

    Ejemplo:
    biblioteca = 4.963
    faltan = 37
    último lote = 37
  */

  const remaining =
    TARGET_GAME_COUNT -
    gameCountBefore;

  const limit =
    Math.min(
      configuredBatchSize,
      remaining
    );

  if (limit <= 0) {
    const savedState =
      await updateImportState(
        environment,
        {
          status: "target-reached",
          last_error: null,
        }
      );

    return {
      ok: true,

      action: "target-reached",

      target:
        buildTargetInfo(
          gameCountBefore
        ),

      state: savedState,
    };
  }

  await updateImportState(
    environment,
    {
      status: "running",

      last_error: null,

      last_run_at:
        new Date().toISOString(),
    }
  );

  try {
    const batch =
      await runBulkBatch({
        request,
        after,
        limit,
      });

    const processed =
      Number(batch.processed || 0);

    const created =
      Number(batch.created || 0);

    const updated =
      Number(batch.updated || 0);

    const failed =
      Number(batch.failed || 0);

    const nextAfter =
      Number(
        batch.nextAfter ??
        after
      );

    const igdbFinished =
      Boolean(batch.finished);

    /*
      Volvemos a contar Supabase después del lote.

      Este número manda sobre los contadores internos.
    */

    const gameCountAfter =
      await getGameCount(environment);

    const targetAfter =
      buildTargetInfo(gameCountAfter);

    let nextStatus =
      "running";

    let action =
      "batch-complete";

    if (igdbFinished) {
      nextStatus =
        "finished";

      action =
        "finished";
    } else if (
      targetAfter.reached
    ) {
      nextStatus =
        "target-reached";

      action =
        "target-reached";
    }

    const nextState = {
      cursor_after: nextAfter,

      total_processed:
        Number(
          state.total_processed || 0
        ) + processed,

      total_created:
        Number(
          state.total_created || 0
        ) + created,

      total_updated:
        Number(
          state.total_updated || 0
        ) + updated,

      total_failed:
        Number(
          state.total_failed || 0
        ) + failed,

      last_batch_processed:
        processed,

      last_duration_seconds:
        batch.durationSeconds ??
        null,

      last_error: null,

      last_run_at:
        new Date().toISOString(),

      status:
        nextStatus,

      finished_at:
        igdbFinished
          ? new Date().toISOString()
          : null,
    };

    const savedState =
      await updateImportState(
        environment,
        nextState
      );

    return {
      ok: true,

      action,

      message:
        targetAfter.reached
          ? `Objetivo alcanzado: ${gameCountAfter} juegos.`
          : igdbFinished
            ? "IGDB no devolvió más juegos."
            : `Lote completado. Biblioteca: ${gameCountAfter}/${TARGET_GAME_COUNT}.`,

      batch: {
        requestedAfter:
          after,

        requestedLimit:
          limit,

        processed,

        created,

        updated,

        failed,

        nextAfter,

        igdbFinished,

        durationSeconds:
          batch.durationSeconds ??
          null,
      },

      library: {
        before:
          gameCountBefore,

        after:
          gameCountAfter,

        added:
          gameCountAfter -
          gameCountBefore,
      },

      target:
        targetAfter,

      state:
        savedState,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    await updateImportState(
      environment,
      {
        status: "error",

        last_error:
          message,

        last_run_at:
          new Date().toISOString(),
      }
    );

    throw error;
  }
}

/* =========================================================
   COMMANDS

   ?action=status
   ?action=start
   ?action=pause
   ?action=resume
   ?action=run
   ?action=reset
========================================================= */

export async function GET(request) {
  try {
    const environment =
      getEnvironment();

    const url =
      new URL(request.url);

    const action =
      String(
        url.searchParams.get(
          "action"
        ) || "status"
      )
        .trim()
        .toLowerCase();

    /* =====================================================
       STATUS
    ===================================================== */

    if (action === "status") {
      const [
        state,
        gameCount,
      ] =
        await Promise.all([
          getImportState(
            environment
          ),

          getGameCount(
            environment
          ),
        ]);

      return jsonResponse({
        ok: true,

        action: "status",

        library: {
          games: gameCount,
        },

        target:
          buildTargetInfo(
            gameCount
          ),

        state,
      });
    }

    /* =====================================================
       START
    ===================================================== */

    if (action === "start") {
      const [
        state,
        gameCount,
      ] =
        await Promise.all([
          getImportState(
            environment
          ),

          getGameCount(
            environment
          ),
        ]);

      const target =
        buildTargetInfo(
          gameCount
        );

      if (target.reached) {
        const savedState =
          await updateImportState(
            environment,
            {
              status:
                "target-reached",

              last_error:
                null,
            }
          );

        return jsonResponse({
          ok: true,

          action:
            "target-reached",

          message:
            `La biblioteca ya tiene ${gameCount} juegos. Objetivo alcanzado.`,

          target,

          state:
            savedState,
        });
      }

      if (
        state.status ===
        "finished"
      ) {
        return jsonResponse({
          ok: true,

          action: "start",

          message:
            "IGDB ya figura como completamente recorrido.",

          target,

          state,
        });
      }

      const savedState =
        await updateImportState(
          environment,
          {
            status:
              "running",

            last_error:
              null,
          }
        );

      return jsonResponse({
        ok: true,

        action: "start",

        message:
          `Importador activado. Biblioteca: ${gameCount}/${TARGET_GAME_COUNT}.`,

        target,

        state:
          savedState,
      });
    }

    /* =====================================================
       PAUSE
    ===================================================== */

    if (action === "pause") {
      const savedState =
        await updateImportState(
          environment,
          {
            status:
              "paused",
          }
        );

      const gameCount =
        await getGameCount(
          environment
        );

      return jsonResponse({
        ok: true,

        action: "pause",

        message:
          "Importador pausado.",

        target:
          buildTargetInfo(
            gameCount
          ),

        state:
          savedState,
      });
    }

    /* =====================================================
       RESUME
    ===================================================== */

    if (action === "resume") {
      const [
        state,
        gameCount,
      ] =
        await Promise.all([
          getImportState(
            environment
          ),

          getGameCount(
            environment
          ),
        ]);

      const target =
        buildTargetInfo(
          gameCount
        );

      if (target.reached) {
        const savedState =
          await updateImportState(
            environment,
            {
              status:
                "target-reached",
            }
          );

        return jsonResponse({
          ok: true,

          action:
            "target-reached",

          message:
            `La biblioteca ya alcanzó el objetivo de ${TARGET_GAME_COUNT} juegos.`,

          target,

          state:
            savedState,
        });
      }

      if (
        state.status ===
        "finished"
      ) {
        return jsonResponse(
          {
            ok: false,

            action:
              "resume",

            message:
              "IGDB ya figura como completamente recorrido.",

            target,

            state,
          },
          400
        );
      }

      const savedState =
        await updateImportState(
          environment,
          {
            status:
              "running",

            last_error:
              null,
          }
        );

      return jsonResponse({
        ok: true,

        action:
          "resume",

        message:
          `Importador reanudado. Biblioteca: ${gameCount}/${TARGET_GAME_COUNT}.`,

        target,

        state:
          savedState,
      });
    }

    /* =====================================================
       RUN

       Procesa exactamente UN lote.
    ===================================================== */

    if (action === "run") {
      const result =
        await executeAutomaticBatch(
          request
        );

      return jsonResponse(
        result
      );
    }

    /* =====================================================
       RESET

       NO lo utilizaremos ahora.

       Reinicia el cursor a cero y pausa el proceso.
       No borra juegos de Supabase.
    ===================================================== */

    if (action === "reset") {
      const savedState =
        await updateImportState(
          environment,
          {
            cursor_after: 0,

            batch_size:
              DEFAULT_BATCH_SIZE,

            status:
              "paused",

            total_processed: 0,

            total_created: 0,

            total_updated: 0,

            total_failed: 0,

            last_batch_processed:
              0,

            last_duration_seconds:
              null,

            last_error: null,

            last_run_at: null,

            finished_at: null,
          }
        );

      const gameCount =
        await getGameCount(
          environment
        );

      return jsonResponse({
        ok: true,

        action: "reset",

        message:
          "Estado del importador reiniciado. Los juegos existentes NO fueron borrados.",

        target:
          buildTargetInfo(
            gameCount
          ),

        state:
          savedState,
      });
    }

    return jsonResponse(
      {
        ok: false,

        error:
          `Acción desconocida: ${action}.`,

        availableActions: [
          "status",
          "start",
          "pause",
          "resume",
          "run",
          "reset",
        ],
      },
      400
    );
  } catch (error) {
    console.error(
      "ERROR IGDB AUTO IMPORT:",
      error
    );

    return jsonResponse(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      500
    );
  }
}
