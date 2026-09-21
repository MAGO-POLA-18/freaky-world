import "./globals.css";

export const metadata = {
  title: "Freaky World",
  description: "El mundo 3D de Freaky Ranking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
