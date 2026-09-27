import type { Metadata } from "next";
import { AdminPanel } from "@/components/account-admin";
export const metadata: Metadata={title:"Shop admin"};
export default function AdminPage(){return <AdminPanel/>;}
