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
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
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

  const router = useRouter();

  const rolesAvailable = ["USER", "ADMIN"];

  const handleCreateUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!email || !firstName || !lastName || !password || !passwordConfirmation) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (selectedRoles.length === 0) {
      setError("Por favor, selecciona al menos un rol.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    const userData = {
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      password_confirmation: passwordConfirmation,
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
  }, [email, firstName, lastName, password, passwordConfirmation, selectedRoles, router]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/users">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Crear nuevo Usuario</p>
      </div>
      {error && (
        <Code color="danger" className="text-wrap">
          {Array.isArray(error) ? error.join(", ") : error}
        </Code>
      )}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Nombre"
          isRequired
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
        />
        <Input
          label="Contraseña"
          placeholder="Ingrese la contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          variant="underlined"
          type="password"
          aria-label="Contraseña"
          isRequired
        />
        <Input
          label="Confirmar Contraseña"
          placeholder="Confirme la contraseña"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          fullWidth
          variant="underlined"
          type="password"
          aria-label="Confirmar Contraseña"
          isRequired
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
        >
          {rolesAvailable.map((role) => (
            <SelectItem key={role} value={role}>
              {role === "USER" ? "Usuario" : role === "ADMIN" ? "Admin" : role}
            </SelectItem>
          ))}
        </Select>
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
              <IconPlus className="h-4" /> Crear Usuario
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
