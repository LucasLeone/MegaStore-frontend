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
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/app/axios";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";

import useUser from "@/app/hooks/useUser";

export default function EditUserPage() {
  const [loading, setLoading] = useState(false);
  // const [fetchingUser, setFetchingUser] = useState(true);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // const [email, setEmail] = useState("");
  // const [selectedRoles, setSelectedRoles] = useState([]);

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // const rolesAvailable = ["USER", "ADMIN"];

  const { user, loading: fetchingUser, error: fetchError } = useUser(id);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      // setEmail(user.email);
      // setSelectedRoles(user.roles.map((role) => role.name));
    }
  }, [user]);

  const handleUpdateUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!firstName || !lastName) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    // if (selectedRoles.length === 0) {
    //   setError("Por favor, selecciona al menos un rol.");
    //   setLoading(false);
    //   return;
    // }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   setError("Por favor, ingresa un correo electrónico válido.");
    //   setLoading(false);
    //   return;
    // }

    const userData = {
      // email,
      first_name: firstName,
      last_name: lastName,
      // roles: selectedRoles,
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
  }, [id, firstName, lastName, router]);

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
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Usuario</p>
      </div>
      {(error || fetchError) && (
        <Code color="danger" className="text-wrap">
          {error || fetchError}
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
        {/* <Input
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
        </Select> */}
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
              <IconEdit className="h-4" /> Actualizar Usuario
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
