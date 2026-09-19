export const metadata = {
  title: "Trip Planner",
  description: "Plan your trip and estimate your travel budget.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
