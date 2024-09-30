"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Link,
  Tooltip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  IconEdit,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconKey,
  IconMail,
  IconUser,
  IconHome,
  IconPhone,
} from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/app/axios";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";

import useUser from "@/app/hooks/useUser";

export default function EditUserPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [selectedRoles, setSelectedRoles] = useState([]);
  const rolesAvailable = ["USER", "ADMIN"];

  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({
    street: "",
    number: "",
    floor: "",
    apartment: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const { user, loading: fetchingUser, error: fetchError } = useUser(id);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setSelectedRoles(user.roles.map((role) => role.name));
      setPhoneNumber(user.phone_number || "");

      if (user.address) {
        setAddress({
          street: user.address.street || "",
          number: user.address.number || "",
          floor: user.address.floor || "",
          apartment: user.address.apartment || "",
          city: user.address.city || "",
          postalCode: user.address.postal_code || "",
          country: user.address.country || "",
        });
      }
    }
  }, [user]);

  const handleUpdateUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (
      !email ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !address.street ||
      !address.number ||
      !address.city ||
      !address.postalCode ||
      !address.country
    ) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("El número de teléfono debe tener entre 9 y 15 dígitos.");
      setLoading(false);
      return;
    }

    const userData = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      address: {
        street: address.street,
        number: address.number,
        floor: address.floor || null,
        apartment: address.apartment || null,
        city: address.city,
        postal_code: address.postalCode,
        country: address.country,
      },
      roles: selectedRoles,
    };

    const token = Cookies.get("access_token");

    try {
      await api.put(`/users/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      if (error.response && error.response.data) {
        const apiErrors = error.response.data.message;
        setError(apiErrors);
      } else {
        setError("Error al actualizar el usuario.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    email,
    firstName,
    lastName,
    phoneNumber,
    address,
    selectedRoles,
    id,
    router,
  ]);

  if (fetchingUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/users">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly aria-label="Volver">
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Usuario</p>
      </div>

      {(error || fetchError) && (
        <Code color="danger" className="text-wrap mb-4">
          {error || fetchError}
        </Code>
      )}

      <div className="space-y-4 mt-4">
        <p className="font-semibold mb-2">Datos del Usuario</p>
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Nombre"
          isRequired
          startContent={
            <div className="pointer-events-none flex items-center">
              <IconUser className="h-5 text-default-500" />
            </div>
          }
        />
        <Input
          label="Apellido"
          placeholder="Ingrese el apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Apellido"
          isRequired
          startContent={
            <div className="pointer-events-none flex items-center">
              <IconUser className="h-5 text-default-500" />
            </div>
          }
        />
        <Input
          label="Email"
          placeholder="Ingrese el correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          variant="underlined"
          type="email"
          aria-label="Email"
          isRequired
          startContent={
            <div className="pointer-events-none flex items-center">
              <IconMail className="h-5 text-default-500" />
            </div>
          }
        />

        <Input
          label="Número de Teléfono"
          placeholder="1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Número de Teléfono"
          isRequired
          startContent={
            <div className="pointer-events-none flex items-center">
              <IconPhone className="h-5 text-default-500" />
            </div>
          }
        />

        <Select
          label="Roles"
          placeholder="Selecciona los roles"
          selectionMode="multiple"
          variant="underlined"
          selectedKeys={selectedRoles}
          onSelectionChange={(keys) => setSelectedRoles(Array.from(keys))}
          aria-label="Roles"
          isRequired
          fullWidth
        >
          {rolesAvailable.map((role) => (
            <SelectItem key={role} value={role}>
              {role === "USER" ? "Usuario" : role === "ADMIN" ? "Admin" : role}
            </SelectItem>
          ))}
        </Select>

        <div className="mb-4">
          <p className="font-semibold mb-2">Dirección</p>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              label="Calle"
              placeholder="25 de mayo"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="flex-1"
              variant="underlined"
              aria-label="Calle"
              isRequired
              startContent={
                <div className="pointer-events-none flex items-center">
                  <IconHome className="h-5 text-default-500" />
                </div>
              }
            />
            <Input
              label="Número"
              placeholder="528"
              value={address.number}
              onChange={(e) => setAddress({ ...address, number: e.target.value })}
              className="flex-1"
              variant="underlined"
              aria-label="Número"
              isRequired
              startContent={
                <div className="pointer-events-none flex items-center">
                  <IconHome className="h-5 text-default-500" />
                </div>
              }
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              label="Piso"
              placeholder="4"
              value={address.floor}
              onChange={(e) => setAddress({ ...address, floor: e.target.value })}
              className="flex-1"
              variant="underlined"
              aria-label="Piso"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <IconHome className="h-5 text-default-500" />
                </div>
              }
            />
            <Input
              label="Departamento"
              placeholder="01"
              value={address.apartment}
              onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
              className="flex-1"
              variant="underlined"
              aria-label="Departamento"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <IconHome className="h-5 text-default-500" />
                </div>
              }
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              label="Ciudad"
              placeholder="Arroyo Cabral"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="flex-1"
              variant="underlined"
              aria-label="Ciudad"
              isRequired
              startContent={
                <div className="pointer-events-none flex items-center">
                  <IconUser className="h-5 text-default-500" />
                </div>
              }
            />
            <Input
              label="Código Postal"
              placeholder="5918"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              className="flex-1"
              variant="underlined"
              aria-label="Código Postal"
              isRequired
              startContent={
                <div className="pointer-events-none flex items-center">
                  <IconUser className="h-5 text-default-500" />
                </div>
              }
            />
          </div>

          <Input
            label="País"
            placeholder="ARG"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            className="flex-1 mb-4"
            variant="underlined"
            aria-label="País"
            isRequired
            startContent={
              <div className="pointer-events-none flex items-center">
                <IconUser className="h-5 text-default-500" />
              </div>
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateUser}
          isDisabled={loading}
          fullWidth
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <IconEdit className="h-4 mr-1" /> Actualizar Usuario
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
