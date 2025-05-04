
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      <Toaster />
    </div>
  );
};

export default AdminLayout;
