import { NextResponse } from "next/server";

/* =========================================================
   CONFIG
========================================================= */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const STATE_ID = 1;

const DEFAULT_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 500;

/* =========================================================
   ENVIRONMENT
========================================================= */

function getEnvironment() {
  const supabaseUrl =
    process.env.SUPABASE_URL?.replace(/\/+$/, "");

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Falta SUPABASE_URL."
    );
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
  const response =
    await fetch(
      `${environment.supabaseUrl}/rest/v1/${path}`,
      {
        ...options,

        headers: {
          apikey:
            environment.supabaseSecret,

          Authorization:
            `Bearer ${environment.supabaseSecret}`,

          "Content-Type":
            "application/json",

          Prefer:
            options.prefer ||
            "return=representation",

          ...(options.headers || {}),
        },

        cache:
          "no-store",
      }
    );

  const text =
    await response.text();

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
   STATE
========================================================= */

async function getImportState(
  environment
) {
  const rows =
    await supabaseRequest(
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
    updated_at:
      new Date().toISOString(),
  };

  const rows =
    await supabaseRequest(
      environment,
      `igdb_import_state?id=eq.${STATE_ID}`,
      {
        method: "PATCH",

        prefer:
          "return=representation",

        body:
          JSON.stringify(payload),
      }
    );

  return (
    Array.isArray(rows)
      ? rows[0]
      : rows
  );
}

/* =========================================================
   HELPERS
========================================================= */

function clampBatchSize(value) {
  const parsed =
    Number(value);

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
  const url =
    new URL(request.url);

  return url.origin;
}

function jsonResponse(
  data,
  status = 200
) {
  return NextResponse.json(
    data,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    }
  );
}

/* =========================================================
   LLAMAR AL IMPORTADOR REAL

   No duplicamos la lógica IGDB.

   Este endpoint solamente controla el proceso.
   El trabajo real continúa haciéndolo:

   /api/igdb/sync?mode=bulk
========================================================= */

async function runBulkBatch({
  request,
  after,
  limit,
}) {
  const baseUrl =
    getBaseUrl(request);

  const url =
    `${baseUrl}/api/igdb/sync` +
    `?mode=bulk` +
    `&after=${after}` +
    `&limit=${limit}`;

  const response =
    await fetch(
      url,
      {
        method: "GET",

        headers: {
          "Cache-Control":
            "no-cache",
        },

        cache:
          "no-store",
      }
    );

  const text =
    await response.text();

  let data;

  try {
    data =
      JSON.parse(text);
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
    await getImportState(
      environment
    );

  if (
    state.status ===
    "finished"
  ) {
    return {
      ok: true,

      action:
        "nothing-to-do",

      message:
        "La importación IGDB ya está terminada.",

      state,
    };
  }

  if (
    state.status ===
    "paused"
  ) {
    return {
      ok: true,

      action:
        "paused",

      message:
        "El importador está pausado.",

      state,
    };
  }

  const after =
    Number(
      state.cursor_after || 0
    );

  const limit =
    clampBatchSize(
      state.batch_size
    );

  /*
    Marcamos running antes de empezar.
  */

  await updateImportState(
    environment,
    {
      status:
        "running",

      last_error:
        null,

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
      Number(
        batch.processed || 0
      );

    const created =
      Number(
        batch.created || 0
      );

    const updated =
      Number(
        batch.updated || 0
      );

    const failed =
      Number(
        batch.failed || 0
      );

    const nextAfter =
      Number(
        batch.nextAfter ??
        after
      );

    const finished =
      Boolean(
        batch.finished
      );

    const nextState = {
      cursor_after:
        nextAfter,

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

      last_error:
        null,

      last_run_at:
        new Date().toISOString(),

      status:
        finished
          ? "finished"
          : "running",

      finished_at:
        finished
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

      action:
        finished
          ? "finished"
          : "batch-complete",

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

        finished,

        durationSeconds:
          batch.durationSeconds ??
          null,
      },

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
        status:
          "error",

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

   El cron utilizará:
   ?action=run
========================================================= */

export async function GET(
  request
) {
  try {
    const environment =
      getEnvironment();

    const url =
      new URL(
        request.url
      );

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

    if (
      action ===
      "status"
    ) {
      const state =
        await getImportState(
          environment
        );

      return jsonResponse({
        ok: true,
        action:
          "status",
        state,
      });
    }

    /* =====================================================
       START

       Empieza desde el cursor que ya está guardado.
    ===================================================== */

    if (
      action ===
      "start"
    ) {
      const state =
        await getImportState(
          environment
        );

      if (
        state.status ===
        "finished"
      ) {
        return jsonResponse({
          ok: true,

          action:
            "start",

          message:
            "La importación ya figura como terminada. Usá reset si querés comenzar otra vez.",

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

        action:
          "start",

        message:
          "Importador activado.",

        state:
          savedState,
      });
    }

    /* =====================================================
       PAUSE
    ===================================================== */

    if (
      action ===
      "pause"
    ) {
      const savedState =
        await updateImportState(
          environment,
          {
            status:
              "paused",
          }
        );

      return jsonResponse({
        ok: true,

        action:
          "pause",

        message:
          "Importador pausado.",

        state:
          savedState,
      });
    }

    /* =====================================================
       RESUME
    ===================================================== */

    if (
      action ===
      "resume"
    ) {
      const state =
        await getImportState(
          environment
        );

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
              "La importación ya está terminada.",
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
          "Importador reanudado.",

        state:
          savedState,
      });
    }

    /* =====================================================
       RUN

       Procesa EXACTAMENTE UN lote.

       Esto permite que Vercel Cron invoque el endpoint
       periódicamente sin crear una cadena infinita
       dentro de una sola Function.
    ===================================================== */

    if (
      action ===
      "run"
    ) {
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

       Lo dejamos disponible, pero NO lo utilizaremos
       ahora.

       Vuelve a ID 0.
    ===================================================== */

    if (
      action ===
      "reset"
    ) {
      const savedState =
        await updateImportState(
          environment,
          {
            cursor_after:
              0,

            batch_size:
              DEFAULT_BATCH_SIZE,

            status:
              "paused",

            total_processed:
              0,

            total_created:
              0,

            total_updated:
              0,

            total_failed:
              0,

            last_batch_processed:
              0,

            last_duration_seconds:
              null,

            last_error:
              null,

            last_run_at:
              null,

            finished_at:
              null,
          }
        );

      return jsonResponse({
        ok: true,

        action:
          "reset",

        message:
          "Estado del importador reiniciado.",

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
