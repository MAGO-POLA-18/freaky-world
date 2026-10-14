import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getEnvironment() {
  const supabaseUrl =
    process.env.SUPABASE_URL;

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
    supabaseUrl:
      supabaseUrl.replace(
        /\/+$/,
        ""
      ),

    supabaseSecret,
  };
}

async function supabaseGet(
  environment,
  path
) {
  const response =
    await fetch(
      `${environment.supabaseUrl}/rest/v1/${path}`,
      {
        headers: {
          apikey:
            environment.supabaseSecret,

          Authorization:
            `Bearer ${environment.supabaseSecret}`,

          Accept:
            "application/json",
        },

        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      `Supabase ${response.status}: ${text}`
    );
  }

  return response.json();
}

export async function GET() {
  try {
    const environment =
      getEnvironment();

    const games =
      await supabaseGet(
        environment,
        [
          "games",
          "?select=",
          [
            "id",
            "slug",
            "name",
            "cover_medium_url",
            "cover_large_url",
            "freaky_official_score",
            "freaky_official_votes",
          ].join(","),

          "&active=eq.true",

          "&freaky_official_score=not.is.null",

          "&freaky_official_score=gt.0",

          "&order=freaky_official_score.desc.nullslast,freaky_official_votes.desc.nullslast,id.asc",

          "&limit=11",
        ].join("")
      );

    return NextResponse.json({
      ok: true,

      games:
        games.map(
          (game, index) => ({
            id:
              game.id,

            slug:
              game.slug,

            name:
              game.name,

            rank:
              index + 1,

            score:
              Number(
                game.freaky_official_score ||
                  0
              ),

            votes:
              Number(
                game.freaky_official_votes ||
                  0
              ),

            cover:
              game.cover_large_url ||
              game.cover_medium_url ||
              null,
          })
        ),
    });
  } catch (error) {
    console.error(
      "WORLD RANKING ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "No se pudo cargar el ranking.",
      },
      {
        status: 500,
      }
    );
  }
}
