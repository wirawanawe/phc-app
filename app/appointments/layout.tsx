import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Janji Temu - PHC Healthcare",
  description: "Buat janji temu dengan spesialis kesehatan kami",
};

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
