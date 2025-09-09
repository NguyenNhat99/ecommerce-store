import { EntypoSprite } from "@entypo-icons/react";
import { DashboardDataProvider } from "@/context/dashboardDataContext";
import Layouts from "./Layouts";

export default function AdminLayout({ children }) {
    return (
        <div className="admin-container position-relative overflow-hidden">
            <DashboardDataProvider>
                <EntypoSprite />
                <Layouts>{children}</Layouts>
            </DashboardDataProvider>
        </div>
    );
}
