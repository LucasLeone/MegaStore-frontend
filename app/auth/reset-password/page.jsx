"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/axios";
import {
    Code,
    Input,
    Button,
    Link
} from "@nextui-org/react";
import {
    IconEye,
    IconEyeOff,
    IconMail,
    IconKey
} from "@tabler/icons-react";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1); // Paso 1: Email, Paso 2: Token y nueva contraseña
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const router = useRouter();

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleEmailSubmit = async () => {
        if (!email) {
            setError("Por favor, ingresa tu email.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Por favor, ingresa un email válido.");
            return;
        }

        try {
            await api.post("/users/send-reset-token", null, {
                params: { email }
            });
            setError(null);
            setSuccessMessage("El token ha sido enviado a tu correo.");
            setStep(2); // Pasar al paso 2
        } catch (error) {
            console.error("Error al enviar el token: ", error);
            setError("No se pudo enviar el token. Verifica el email e intenta nuevamente.");
        }
    };

    const handleResetPassword = async () => {
        if (!token || !newPassword || !confirmPassword) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            await api.post("/users/reset-password", null, {
                params: {
                    email,
                    token,
                    newPassword
                }
            });
            setError(null);
            setSuccessMessage("Contraseña restablecida con éxito.");
            router.push("/auth/login"); // Redirigir al login después de restablecer la contraseña
        } catch (error) {
            console.error("Error al restablecer la contraseña: ", error);
            setError("No se pudo restablecer la contraseña. Verifica el token e intenta nuevamente.");
        }
    };

    return (
        <div className="container mx-auto grid max-w-lg p-4 border rounded-2xl m-4 mt-32 bg-white">
            <p className="text-center text-2xl basis-full font-bold">
                {step === 1 ? "Restablecer contraseña" : "Ingresar nueva contraseña"}
            </p>
            {error && <Code color="danger" className="text-wrap">{error}</Code>}
            {successMessage && <Code color="success" className="text-wrap">{successMessage}</Code>}
            {step === 1 ? (
                <>
                    <Input
                        type="email"
                        label="Email"
                        placeholder="pedro@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2"
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconMail className="h-5 text-default-500" />
                            </div>
                        }
                    />
                    <Button
                        onClick={handleEmailSubmit}
                        className="mt-2 font-bold text-white"
                        color="success"
                    >
                        Enviar
                    </Button>
                </>
            ) : (
                <>
                    <Input
                        type="text"
                        label="Token"
                        placeholder="Ingresa el token recibido"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="mt-2"
                    />
                    <Input
                        type={isVisible ? "text" : "password"}
                        label="Nueva Contraseña"
                        placeholder="********"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-2"
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconKey className="h-5 text-default-500" />
                            </div>
                        }
                        endContent={
                            <Button isIconOnly size="sm" variant="light" className="focus:outline-none" onClick={toggleVisibility} aria-label="toggle password visibility">
                                {isVisible ? <IconEyeOff className="h-6 text-default-400 pointer-events-none" /> : <IconEye className="h-6 text-default-400 pointer-events-none" />}
                            </Button>
                        }
                    />
                    <Input
                        type={isVisible ? "text" : "password"}
                        label="Confirmar Contraseña"
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-2"
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconKey className="h-5 text-default-500" />
                            </div>
                        }
                        endContent={
                            <Button isIconOnly size="sm" variant="light" className="focus:outline-none" onClick={toggleVisibility} aria-label="toggle password visibility">
                                {isVisible ? <IconEyeOff className="h-6 text-default-400 pointer-events-none" /> : <IconEye className="h-6 text-default-400 pointer-events-none" />}
                            </Button>
                        }
                    />
                    <Button
                        onClick={handleResetPassword}
                        className="mt-2 font-bold text-white"
                        color="success"
                    >
                        Restablecer contraseña
                    </Button>
                </>
            )}
            <div className="text-center mt-2">
                <Link href="/auth/login">Volver al inicio de sesión</Link>
            </div>
        </div>
    );
}
