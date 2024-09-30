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
    IconKey,
    IconMail,
    IconUser
} from "@tabler/icons-react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleRegister = async () => {
        if (!email || !firstName || !lastName || !password || !passwordConfirmation) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        if (email && !/\S+@\S+\.\S+/.test(email)) {
            setError("Por favor, ingresa un email válido.");
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            await api.post('/auth/register', {
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                password_confirmation: passwordConfirmation
            });

            router.push('/auth/login');
        } catch (error) {
            console.error("Error al registrar: ", error);
            if (error.response && error.response.data) {
                const apiErrors = Object.values(error.response.data.message);
                setError(apiErrors);
            } else {
                setError("Error al registrar. Por favor, intenta de nuevo.");
            }
        }
    };

    return (
        <div className='container mx-auto grid max-w-lg p-4 border rounded-2xl m-4 mt-32 bg-white'>
            <p className="text-center text-2xl basis-full font-bold">Crear cuenta</p>
            {error && <Code color='danger' className='text-wrap'>{error}</Code>}
            <Input
                type="email"
                label='Email'
                placeholder='tu@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='mt-2'
                startContent={
                    <div className="pointer-events-none flex items-center">
                        <IconMail className="h-5 text-default-500" />
                    </div>
                }
            />
            <Input
                type="text"
                label='Nombre'
                placeholder='Tu nombre'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className='mt-2'
                startContent={
                    <div className="pointer-events-none flex items-center">
                        <IconUser className="h-5 text-default-500" />
                    </div>
                }
            />
            <Input
                type="text"
                label='Apellido'
                placeholder='Tu apellido'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className='mt-2'
                startContent={
                    <div className="pointer-events-none flex items-center">
                        <IconUser className="h-5 text-default-500" />
                    </div>
                }
            />
            <Input
                type={isVisible ? "text" : "password"}
                label='Contraseña'
                placeholder='********'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='mt-2'
                startContent={
                    <div className="pointer-events-none flex items-center">
                        <IconKey className="h-5 text-default-500" />
                    </div>
                }
                endContent={
                    <Button isIconOnly size='sm' variant='light' className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                        {isVisible ? (
                            <IconEyeOff className="h-6 text-default-400 pointer-events-none" />
                        ) : (
                            <IconEye className="h-6 text-default-400 pointer-events-none" />
                        )}
                    </Button>
                }
            />
            <Input
                type={isVisible ? "text" : "password"}
                label='Confirmar Contraseña'
                placeholder='********'
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className='mt-2'
                startContent={
                    <div className="pointer-events-none flex items-center">
                        <IconKey className="h-5 text-default-500" />
                    </div>
                }
                endContent={
                    <Button isIconOnly size='sm' variant='light' className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                        {isVisible ? (
                            <IconEyeOff className="h-6 text-default-400 pointer-events-none" />
                        ) : (
                            <IconEye className="h-6 text-default-400 pointer-events-none" />
                        )}
                    </Button>
                }
            />
            <Button
                onClick={handleRegister}
                className='mt-2 font-bold text-white'
                color='success'
            >
                Registrarse
            </Button>
            <div className="text-center mt-2 flex flex-row justify-center items-center gap-2">
                <span className='text-center'>¿Ya tienes una cuenta?</span>
                <Link className='text-center' href='/auth/login'>
                    Iniciar sesión
                </Link>
            </div>
        </div>
    );
}
