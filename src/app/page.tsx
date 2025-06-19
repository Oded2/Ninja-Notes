import ClientHome from "@/components/ClientHome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ninja Notes",
  description: "Browser only secure notes",
};

export default function Home() {
  return <ClientHome />;
}
