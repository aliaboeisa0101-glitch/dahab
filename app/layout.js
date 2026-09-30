export const metadata = {
  title: "DAHAB — نظام إدارة المصنع",
  description: "نظام إدارة العمال والحضور والانصراف والرواتب لمصنع DAHAB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0c0b09", color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
