const BASE44_APP_ID =
  "6a6fc454987c4d7152704e28";

const BASE44_API =
  `https://base44.app/api/apps/${BASE44_APP_ID}/entities/Game`;

export async function GET() {
  try {
    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    /*
      Misma lógica básica del Ranking real:

      - no ocultos
      - no archivados
      - no futuros
      - orden ranking_sort_key
    */

    const query = {
      is_hidden: {
        $ne: true,
      },

      status: {
        $ne: "archivado",
      },

      $or: [
        {
          release_date: {
            $lte: today,
          },
        },

        {
          release_date: null,
        },

        {
          release_date: "",
        },
      ],
    };

    const params =
      new URLSearchParams({
        q: JSON.stringify(
          query
        ),

        sort:
          "ranking_sort_key",

        limit:
          "10",

        fields: [
          "id",
          "title",
          "cover_image",
          "release_year",
          "avg_score",
          "votes_count",
          "community_score",
          "external_rating",
          "community_votes",
          "external_rating_count",
        ].join(","),
      });

    const response =
      await fetch(
        `${BASE44_API}?${params.toString()}`,
        {
          headers: {
            "X-App-Id":
              BASE44_APP_ID,
          },

          cache:
            "no-store",
        }
      );

    if (
      !response.ok
    ) {
      const message =
        await response.text();

      console.error(
        "Base44 TOP 10 error:",
        response.status,
        message
      );

      return Response.json(
        {
          error:
            "No se pudo cargar el ranking.",
        },
        {
          status: 502,
        }
      );
    }

    const payload =
      await response.json();

    /*
      Dejamos preparado el código
      para las dos formas posibles
      de respuesta de Base44.
    */

    const games =
      Array.isArray(payload)
        ? payload
        : Array.isArray(
              payload?.data
            )
          ? payload.data
          : Array.isArray(
                payload?.items
              )
            ? payload.items
            : [];

    return Response.json({
      games:
        games.slice(
          0,
          10
        ),
    });
  } catch (error) {
    console.error(
      "WORLD TOP 10:",
      error
    );

    return Response.json(
      {
        error:
          "Error interno cargando el ranking.",
      },
      {
        status: 500,
      }
    );
  }
}
