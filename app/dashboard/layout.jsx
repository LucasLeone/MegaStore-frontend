"use client";

import "@/styles/globals.css";
import { Sidebar, SidebarBody, SidebarLink } from "@/app/components/Sidebar";
import { useEffect, useState } from "react";
import {
  IconHome,
  IconPackage,
  IconArrowLeft,
  IconChartBar,
  IconUser,
  IconUsersGroup
} from "@tabler/icons-react";
import { Link } from "@nextui-org/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { IconReportMoney } from "@tabler/icons-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user");
    router.push("/auth/login");
  };

  const menuItems = [
    { label: "Inicio", path: "/dashboard", icon: <IconHome /> },
    // { label: "Estadísticas", path: "/dashboard/statitics", icon: <IconChartBar /> },
    { label: "Productos", path: "/dashboard/products", icon: <IconPackage /> },
    { label: "Usuarios", path: "/dashboard/users", icon: <IconUsersGroup /> },
    { label: "Ventas", path: "/dashboard/sales", icon: <IconReportMoney /> },
    { label: "Estadísticas", path: "/dashboard/stats", icon: <IconChartBar /> },
    {
      label: "Cerrar sesión",
      icon: <IconArrowLeft />,
      className: "text-red-500 hover:text-red-700",
      onClick: handleLogout,
    }
  ];

  useEffect(() => {
    const token = Cookies.get("access_token");
    const userCookie = Cookies.get("user");

    if (!token || !userCookie) {
      router.push("/auth/login");
      return;
    }

    if (token && userCookie) {
      const parsedUser = JSON.parse(userCookie);
      setUser(parsedUser);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      const hasAdminRole = user.roles && user.roles.some(role => role.name === "ADMIN");
      if (!hasAdminRole) {
        router.push("/");
      }
    }
  }, [user, router]);


  return (
    <div className="flex md:min-h-screen flex-wrap md:flex-nowrap">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10 min-h-screen">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {menuItems.map((item) => (
                <SidebarLink
                  key={item.label}
                  link={item}
                  onClick={item.onClick}
                  className={item.className || ""}
                />
              ))}
            </div>
          </div>
          <div>
            {user && (
              <SidebarLink
                link={{
                  label: `${user.first_name} ${user.last_name}`,
                  path: "/dashboard/profile",
                  icon: <IconUser />,
                }}
              />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-grow p-4 mb-10 md:mb-0">
        {children}
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 text-center">
        <p>MS</p>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre"
      >
        Megastore
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 text-center">
        <p>MS</p>
      </div>
    </Link>
  );
};
