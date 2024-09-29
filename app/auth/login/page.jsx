"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/axios";
import Cookies from "js-cookie";
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
    IconMail
} from "@tabler/icons-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleLogin = async () => {
        
        if (!email || !password) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        if (email && !/\S+@\S+\.\S+/.test(email)) {
            setError("Por favor, ingresa un email válido.");
            return;
        }

        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            const user = response.data.user;
            const access_token = response.data['jwt-token'];
            const expires = 5 / 24; // 5 horas

            Cookies.set('user', JSON.stringify(user), { expires });
            Cookies.set('access_token', access_token, { expires });

            const isAdmin = user.roles.some(role => role.name === 'ADMIN');

            if (isAdmin) {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Error al iniciar sesión: ", error);
            if (error.response && error.response.data) {
                const apiErrors = Object.values(error.response.data.message);
                setError(apiErrors);
            } else {
                setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
            }
        }
    };

    return (
        <div className='container mx-auto grid max-w-lg p-4 border rounded-2xl m-4 mt-32 bg-white'>
            <p className="text-center text-2xl basis-full font-bold">Iniciar sesión</p>
            {error && <Code color='danger' className='text-wrap'>{error}</Code>}
            <Input
                type="email"
                label='Email'
                placeholder='pedro@email.com'
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
            <Button
                onClick={handleLogin}
                className='mt-2 font-bold text-white'
                color='success'
            >
                Iniciar sesión
            </Button>
            <div className="text-center mt-2 flex flex-row justify-center items-center gap-2">
                <Link className='text-center' href='/auth/reset-password-request'>
                    ¿Olvidaste tu contraseña?
                </Link>
                <span className='text-center'>·</span>
                <Link className='text-center' href='/auth/register'>
                    ¿No tienes una cuenta?
                </Link>
            </div>
        </div>
    );
}
