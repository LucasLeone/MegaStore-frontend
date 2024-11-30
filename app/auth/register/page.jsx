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
    IconUser,
    IconHome
} from "@tabler/icons-react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState({
        street: "",
        number: "",
        floor: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
    });
    const [error, setError] = useState(null);
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleRegister = async () => {
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
            !address.postalCode ||
            !address.country
        ) {
            setError("Por favor, completa todos los campos requeridos.");
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

        if (!/^[0-9]{9,15}$/.test(phoneNumber)) {
            setError("El número de teléfono debe tener entre 9 y 15 dígitos.");
            return;
        }


        try {
            await api.post('/auth/register', {
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                password_confirmation: passwordConfirmation,
                phone_number: phoneNumber,
                address: {
                    street: address.street,
                    number: address.number,
                    floor: address.floor,
                    apartment: address.apartment,
                    city: address.city,
                    state: address.state,
                    postal_code: address.postalCode,
                    country: address.country
                }
            });

            router.push('/auth/login');
        } catch (error) {
            console.error("Error al registrar: ", error);
            if (error.response && error.response.data) {
                const apiErrors = error.response.data.message || "Error al registrar. Por favor, intenta de nuevo.";
                setError(apiErrors);
            } else {
                setError("Error al registrar. Por favor, intenta de nuevo.");
            }
        }
    };

    return (
        <div className='container mx-auto max-w-lg p-6 border rounded-2xl m-4 bg-white shadow-md'>
            <p className="text-center text-2xl font-bold mb-4">Crear cuenta</p>
            {error && <Code color='danger' className='text-wrap mb-4'>{error}</Code>}

            <p className="font-semibold mb-2">Datos del Usuario</p>

            <Input
                type="email"
                label='Email'
                placeholder='tu@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='mb-4'
                startContent={
                    <div className="pointer-events-none flex items-center">
                        <IconMail className="h-5 text-default-500" />
                    </div>
                }
            />

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input
                    type="text"
                    label='Nombre'
                    placeholder='Tu nombre'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className='flex-1'
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
                    className='flex-1'
                    startContent={
                        <div className="pointer-events-none flex items-center">
                            <IconUser className="h-5 text-default-500" />
                        </div>
                    }
                />
            </div>

            <Input
                type="text"
                label='Número de Teléfono'
                placeholder='1234567890'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className='mb-4'
                startContent={
                    <div className="pointer-events-none flex items-center">
                        <IconUser className="h-5 text-default-500" />
                    </div>
                }
            />

            <div className="mb-4">
                <Input
                    type={isVisible ? "text" : "password"}
                    label='Contraseña'
                    placeholder='********'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='mb-4'
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
                    className='mb-4'
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
            </div>

            <div className="mb-4">
                <p className="font-semibold mb-2">Dirección</p>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input
                        type="text"
                        label='Calle'
                        placeholder='25 de mayo'
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className='flex-1'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconHome className="h-5 text-default-500" />
                            </div>
                        }
                    />
                    <Input
                        type="text"
                        label='Número'
                        placeholder='528'
                        value={address.number}
                        onChange={(e) => setAddress({ ...address, number: e.target.value })}
                        className='flex-1'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconHome className="h-5 text-default-500" />
                            </div>
                        }
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input
                        type="text"
                        label='Piso'
                        placeholder='4'
                        value={address.floor}
                        onChange={(e) => setAddress({ ...address, floor: e.target.value })}
                        className='flex-1'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconHome className="h-5 text-default-500" />
                            </div>
                        }
                    />
                    <Input
                        type="text"
                        label='Departamento'
                        placeholder='01'
                        value={address.apartment}
                        onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                        className='flex-1'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconHome className="h-5 text-default-500" />
                            </div>
                        }
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Input
                        type="text"
                        label='Ciudad'
                        placeholder='Arroyo Cabral'
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className='flex-1 mb-4'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconUser className="h-5 text-default-500" />
                            </div>
                        }
                    />
                    <Input
                        type="text"
                        label='Provincia'
                        placeholder='Córdoba'
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className='flex-1'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconUser className="h-5 text-default-500" />
                            </div>
                        }
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input
                        type="text"
                        label='País'
                        placeholder='ARG'
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className='flex-1'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconUser className="h-5 text-default-500" />
                            </div>
                        }
                    />
                    <Input
                        type="text"
                        label='Código Postal'
                        placeholder='5918'
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        className='flex-1'
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <IconUser className="h-5 text-default-500" />
                            </div>
                        }
                    />
                </div>

            </div>

            <Button
                onClick={handleRegister}
                className='w-full font-bold text-white'
                color='success'
            >
                Registrarse
            </Button>

            <div className="text-center mt-4 flex flex-row justify-center items-center gap-2">
                <span className='text-center'>¿Ya tienes una cuenta?</span>
                <Link className='text-center' href='/auth/login'>
                    Iniciar sesión
                </Link>
            </div>
        </div>
    );
}
