"use client";

import { useState, useEffect } from "react";
import api from "@/app/axios";
import {
    Tabs,
    Tab,
    Button,
    Input,
    Code,
    Table,
    Card,
    CardHeader,
    CardBody,
    Text,
    Spacer,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
} from "@nextui-org/react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("salesReport");
    const [period, setPeriod] = useState("daily");
    const [salesReport, setSalesReport] = useState(null);
    const [customerStats, setCustomerStats] = useState(null);
    const [error, setError] = useState(null);
    const [loadingSales, setLoadingSales] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);

    // Función para obtener el informe de ventas
    const fetchSalesReport = async () => {
        setLoadingSales(true);
        setError(null);
        try {
            const response = await api.get("/sales/reports", {
                params: { period },
            });
            setSalesReport(response.data);
        } catch (err) {
            console.error("Error al obtener el informe de ventas:", err);
            setError("No se pudo obtener el informe de ventas.");
        } finally {
            setLoadingSales(false);
        }
    };

    // Función para obtener las estadísticas de clientes
    const fetchCustomerStatistics = async () => {
        setLoadingStats(true);
        setError(null);
        try {
            const response = await api.get("/sales/customer-statistics");
            setCustomerStats(response.data);
        } catch (err) {
            console.error("Error al obtener las estadísticas de clientes:", err);
            setError("No se pudo obtener las estadísticas de clientes.");
        } finally {
            setLoadingStats(false);
        }
    };

    // Efecto para cargar las estadísticas de clientes al montar la página
    useEffect(() => {
        if (activeTab === "customerStats") {
            fetchCustomerStatistics();
        }
    }, [activeTab]);

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <p>Panel de Administrador</p>
                </CardHeader>
                <CardBody>
                    <Tabs
                        value={activeTab}
                        onChange={(value) => setActiveTab(value)}
                        aria-label="Panel de Administrador"
                    >
                        <Tab key="salesReport" title="Informes de Ventas">
                            <Spacer y={1} />
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                                <Input
                                    clearable
                                    label="Período"
                                    placeholder="Selecciona un período"
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    width="200px"
                                    list="periodOptions"
                                />
                                <datalist id="periodOptions">
                                    <option value="daily" />
                                    <option value="weekly" />
                                    <option value="monthly" />
                                </datalist>
                                <Button
                                    onClick={fetchSalesReport}
                                    disabled={loadingSales}
                                >
                                    {loadingSales ? "Cargando..." : "Generar Informe"}
                                </Button>
                            </div>
                            <Spacer y={1} />
                            {error && <Code color="danger">{error}</Code>}
                            {salesReport && (
                                <div className="mt-4">
                                    <p>Total de Ventas: ${salesReport.totalSales}</p>
                                    <p>Número de Pedidos: {salesReport.totalOrders}</p>
                                    <Spacer y={1} />
                                    <Bar
                                        data={{
                                            labels: Object.keys(salesReport.topProducts),
                                            datasets: [
                                                {
                                                    label: "Productos Más Vendidos",
                                                    data: Object.values(salesReport.topProducts),
                                                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: "top",
                                                },
                                                title: {
                                                    display: true,
                                                    text: "Productos Más Vendidos",
                                                },
                                            },
                                        }}
                                    />
                                    <Spacer y={2} />
                                    <Table
                                        aria-label="Tabla de Ventas"
                                        css={{
                                            height: "auto",
                                            minWidth: "100%",
                                        }}
                                    >
                                        <TableHeader>
                                            <TableColumn>Producto</TableColumn>
                                            <TableColumn>Cantidad Vendida</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(salesReport.topProducts).map(
                                                ([product, quantity]) => (
                                                    <TableRow key={product}>
                                                        <TableCell>{product}</TableCell>
                                                        <TableCell>{quantity}</TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </Tab>
                        <Tab key="customerStats" title="Estadísticas de Clientes">
                            <Spacer y={1} />
                            {loadingStats ? (
                                <p>Loading...</p>
                            ) : (
                                <>
                                    {error && <Code color="danger">{error}</Code>}
                                    {customerStats && (
                                        <div className="mt-4">
                                            <p>Valor Promedio del Pedido: ${customerStats.averageOrderValue.toFixed(2)}</p>
                                            <Spacer y={1} />
                                            
                                            <Bar
                                                data={{
                                                    labels: Object.keys(customerStats.favoriteProducts),
                                                    datasets: [
                                                        {
                                                            label: "Productos Favoritos",
                                                            data: Object.values(customerStats.favoriteProducts),
                                                            backgroundColor: "rgba(153, 102, 255, 0.6)",
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: {
                                                            position: "top",
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: "Productos Favoritos de los Clientes",
                                                        },
                                                    },
                                                }}
                                            />
                                            
                                            <Spacer y={2} />
                                            
                                            <Pie
                                                data={{
                                                    labels: ["Frecuencia de Compra", "Valor Promedio del Pedido"],
                                                    datasets: [
                                                        {
                                                            label: "Estadísticas de Clientes",
                                                            data: [
                                                                Object.keys(customerStats.purchaseFrequency).length,
                                                                customerStats.averageOrderValue,
                                                            ],
                                                            backgroundColor: [
                                                                "rgba(255, 99, 132, 0.6)",
                                                                "rgba(54, 162, 235, 0.6)",
                                                            ],
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: {
                                                            position: "top",
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: "Frecuencia de Compra vs Valor Promedio",
                                                        },
                                                    },
                                                }}
                                            />
                                            
                                            <Spacer y={2} />
                                            
                                            <Table
                                                aria-label="Tabla de Estadísticas de Clientes"
                                                css={{
                                                    height: "auto",
                                                    minWidth: "100%",
                                                }}
                                            >
                                                <TableHeader>
                                                    <TableColumn>ID de Cliente</TableColumn>
                                                    <TableColumn>Frecuencia de Compra</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries(customerStats.purchaseFrequency).map(
                                                        ([userId, frequency]) => (
                                                            <TableRow key={userId}>
                                                                <TableCell>{userId}</TableCell>
                                                                <TableCell>{frequency}</TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </>
                            )}
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    );
}
