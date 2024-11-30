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
import { IconPlus, IconArrowLeft, IconEye, IconEyeOff, IconKey, IconMail, IconUser, IconHome, IconPhone } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import api from "@/app/axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [selectedRoles, setSelectedRoles] = useState([]);
  const rolesAvailable = ["USER", "ADMIN"];

  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({
    street: "",
    number: "",
    floor: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const router = useRouter();

  const handleCreateUser = useCallback(async () => {
    setLoading(true);
    setError(null);


    if (
      !email ||
      !firstName ||
      !lastName ||
      !password ||
      !passwordConfirmation ||
      !phoneNumber ||
      !address.street ||
      !address.number ||
      !address.city ||
      !address.state ||
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

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
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
      password,
      password_confirmation: passwordConfirmation,
      phone_number: phoneNumber,
      address: {
        street: address.street,
        number: address.number,
        floor: address.floor || null,
        apartment: address.apartment || null,
        city: address.city,
        state: address.state || null,
        postal_code: address.postalCode,
        country: address.country,
      },
      roles: selectedRoles,
    };

    const token = Cookies.get("access_token");

    try {
      await api.post("/users", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      if (error.response && error.response.data) {
        const apiErrors = error.response.data.message;
        setError(apiErrors);
      } else {
        setError("Error al crear el usuario.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    email,
    firstName,
    lastName,
    password,
    passwordConfirmation,
    phoneNumber,
    address,
    selectedRoles,
    router,
  ]);

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
        <p className="text-2xl font-bold">Crear nuevo Usuario</p>
      </div>

      {error && (
        <Code color="danger" className="text-wrap mb-4">
          {Array.isArray(error) ? error.join(", ") : error}
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

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            label="Contraseña"
            placeholder="Ingrese la contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="underlined"
            type={isPasswordVisible ? "text" : "password"}
            aria-label="Contraseña"
            isRequired
            startContent={
              <div className="pointer-events-none flex items-center">
                <IconKey className="h-5 text-default-500" />
              </div>
            }
            endContent={
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="focus:outline-none"
                type="button"
                onClick={togglePasswordVisibility}
                aria-label="toggle password visibility"
              >
                {isPasswordVisible ? (
                  <IconEyeOff className="h-6 text-default-400 pointer-events-none" />
                ) : (
                  <IconEye className="h-6 text-default-400 pointer-events-none" />
                )}
              </Button>
            }
          />
          <Input
            label="Confirmar Contraseña"
            placeholder="Confirme la contraseña"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            fullWidth
            variant="underlined"
            type={isPasswordVisible ? "text" : "password"}
            aria-label="Confirmar Contraseña"
            isRequired
            startContent={
              <div className="pointer-events-none flex items-center">
                <IconKey className="h-5 text-default-500" />
              </div>
            }
            endContent={
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="focus:outline-none"
                type="button"
                onClick={togglePasswordVisibility}
                aria-label="toggle confirm password visibility"
              >
                {isPasswordVisible ? (
                  <IconEyeOff className="h-6 text-default-400 pointer-events-none" />
                ) : (
                  <IconEye className="h-6 text-default-400 pointer-events-none" />
                )}
              </Button>
            }
          />
        </div>

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
              label="Provincia"
              placeholder="Córdoba"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className="flex-1"
              variant="underlined"
              aria-label="Provincia"
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
          onPress={handleCreateUser}
          isDisabled={loading}
          fullWidth
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <IconPlus className="h-4 mr-1" /> Crear Usuario
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
