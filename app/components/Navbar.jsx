"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Divider,
  Badge
} from "@nextui-org/react";
import { IconUser, IconShoppingCart } from "@tabler/icons-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "../axios";

export default function NavbarHome() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth/login");
  }

  const fetchCart = useCallback(() => {
    const token = Cookies.get('access_token');

    api.get('/carts/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        setCartCount(response.data.cartItems.length);
      })
      .catch(error => {
        console.error('Error al obtener el carrito:', error);
      });
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <Navbar isBordered>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <Link href="/" color="foreground">
            <p className="font-bold text-inherit">MegaStore</p>
          </Link>
        </NavbarBrand>
        <NavbarItem>
          <Link color="foreground" href="#">
            Hombres
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Mujeres
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Niños
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Input placeholder="Buscar productos..." variant="bordered" />
        </NavbarItem>
        <NavbarItem>
          <Link href="/cart/">
            <Badge
              content={cartCount}
              size="lg"
              color="primary"
            >
              <Button isIconOnly variant="light">
                <IconShoppingCart className="w-6" />
              </Button>
            </Badge>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <IconUser className="w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Dropdown de cuenta">
              <DropdownSection showDivider title="Mi Cuenta">
                {/* <DropdownItem key="none"><Divider /></DropdownItem> */}
                <DropdownItem key="perfil">Perfil</DropdownItem>
                <DropdownItem key="ordenes">Órdenes</DropdownItem>
                <DropdownItem key="direcciones">Direcciones</DropdownItem>
                <DropdownItem key="metodospago">Métodos de Pago</DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem key="cerrarsesion" color="danger" onPress={handleLogout}>Cerrar Sesión</DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar >
  );
}
