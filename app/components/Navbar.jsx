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
  Divider
} from "@nextui-org/react";
import { IconUser, IconShoppingCart } from "@tabler/icons-react";

export default function NavbarHome() {
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
            <Button isIconOnly variant="light">
              <IconShoppingCart className="w-6" />
            </Button>
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
                <DropdownItem key="cerrarsesion" color="danger">Cerrar Sesión</DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
