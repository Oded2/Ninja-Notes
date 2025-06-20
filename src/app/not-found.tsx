import NotFoundClient from "@/components/NotFoundClient";
import { useUserStore } from "@/lib/stores/userStore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFound() {
  return <NotFoundClient />;
}
