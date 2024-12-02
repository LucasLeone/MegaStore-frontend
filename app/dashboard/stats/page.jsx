"use client";

import { useState, useEffect, useRef } from "react";
import useReports from "@/app/hooks/useReports";
import useCustomersStatistics from "@/app/hooks/useCustomersStatistics";
import useUsers from "@/app/hooks/useUsers";
import useBrands from "@/app/hooks/useBrands";
import useCategories from "@/app/hooks/useCategories";
import useSubcategories from "@/app/hooks/useSubcategories";
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  DateRangePicker,
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { IconDownload } from "@tabler/icons-react";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function StatsPage() {
  const searchParams = useSearchParams();
  const printRef = useRef();

  const initialFilters = {
    period: searchParams.get('period') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    customerId: searchParams.get('customerId') || '',
  };

  const [dateRange, setDateRange] = useState({
    start: initialFilters.startDate ? parseDate(initialFilters.startDate) : null,
    end: initialFilters.endDate ? parseDate(initialFilters.endDate) : null,
  });

  const [filters, setFilters] = useState(initialFilters);

  const { reports, loading: loadingReports, error: errorReports, fetchReports } = useReports();
  const { customersStatistics, loading: loadingCustomersStatistics, error: errorCustomersStatistics } = useCustomersStatistics();
  const { users, loading: loadingUsers, error: errorUsers } = useUsers();
  const { brands, loading: loadingBrands, error: errorBrands } = useBrands();
  const { categories, loading: loadingCategories, error: errorCategories } = useCategories();
  const { subcategories, loading: loadingSubcategories, error: errorSubcategories } = useSubcategories();

  useEffect(() => {
    fetchReports(filters);
  }, [fetchReports, filters]);

  if (
    loadingReports ||
    loadingCustomersStatistics ||
    loadingUsers ||
    loadingBrands ||
    loadingCategories ||
    loadingSubcategories
  ) {
    return <p>Cargando...</p>;
  }

  if (errorReports) {
    return <p>Error en reports: {errorReports}</p>;
  }

  if (errorCustomersStatistics) {
    return <p>Error en estadísticas de clientes: {errorCustomersStatistics}</p>;
  }

  if (errorUsers) {
    return <p>Error en usuarios: {errorUsers}</p>;
  }

  if (errorBrands) {
    return <p>Error en marcas: {errorBrands}</p>;
  }

  if (errorCategories) {
    return <p>Error en categorías: {errorCategories}</p>;
  }

  if (errorSubcategories) {
    return <p>Error en subcategorías: {errorSubcategories}</p>;
  }

  const userMap = users.reduce((acc, user) => {
    acc[user.id.toString()] = `${user.first_name} ${user.last_name}`;
    return acc;
  }, {});

  const getUserNameById = (id) => userMap[id] || `Usuario ID ${id}`;

  const brandOptions = brands.map(brand => ({ label: brand.name, value: brand.id.toString() }));
  const categoryOptions = categories.map(category => ({ label: category.name, value: category.id.toString() }));
  const subcategoryOptions = subcategories.map(sub => ({ label: sub.name, value: sub.id.toString() }));
  const customerOptions = users.map(user => ({ label: `${user.first_name} ${user.last_name}`, value: user.id.toString() }));

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value || '',
    }));
  };

  const handleDateChange = (selectedDates) => {
    if (selectedDates.start && selectedDates.end) {
      const startDate = selectedDates.start.toString().split('T')[0];
      const endDate = selectedDates.end.toString().split('T')[0];
      setDateRange({
        start: selectedDates.start,
        end: selectedDates.end,
      });
      setFilters((prev) => ({
        ...prev,
        startDate,
        endDate,
        period: '',
      }));
    } else {
      setDateRange({
        start: null,
        end: null,
      });
      setFilters((prev) => ({
        ...prev,
        startDate: '',
        endDate: '',
      }));
    }
  };

  const topProductsData = reports.topProducts ? Object.entries(reports.topProducts) : [];
  topProductsData.sort((a, b) => b[1] - a[1])
  const productNames = topProductsData.map(([productName]) => productName);
  const productSales = topProductsData.map(([_, sales]) => sales);

  const topProductsChartOptions = {
    chart: {
      type: 'bar',
    },
    title: {
      text: 'Top Productos',
    },
    xaxis: {
      categories: productNames,
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: 'Ventas',
      },
    },
  };

  const topCustomersData = customersStatistics.topCustomers ? Object.entries(customersStatistics.topCustomers) : [];
  topCustomersData.sort((a, b) => b[1] - a[1])
  const customerNames = topCustomersData.map(([userId]) => getUserNameById(userId));
  const customerSpent = topCustomersData.map(([_, totalSpent]) => totalSpent);

  const topCustomersChartOptions = {
    chart: {
      type: 'bar',
    },
    title: {
      text: 'Top Clientes',
    },
    xaxis: {
      categories: customerNames,
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: 'Total Gastado',
      },
    },
  };

  const exportPDF = async () => {
    const input = printRef.current;
    if (!input) {
      console.error("No se encontró el contenido para exportar.");
      return;
    }

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: 0.5,
        filename: "estadisticas.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }
  
      html2pdf().set(opt).from(input).save();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  }

  return (
    <div ref={printRef} className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex flex-wrap justify-between mb-4">
        <p className="text-2xl font-bold">Estadísticas</p>
        <Button
          color="primary"
          onClick={exportPDF}
        >
          <IconDownload className="h-5" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 p-4 border rounded">
        <div className="flex flex-wrap justify-between mb-4">
          <p className="text-xl font-semibold">Filtros</p>
          <Button
            color="warning"
            onClick={() => {
              setFilters({
                period: '',
                brand: '',
                category: '',
                subcategory: '',
                startDate: '',
                endDate: '',
                customerId: '',
              });
              setDateRange({
                start: null,
                end: null,
              });
            }}
          >
            Limpiar filtros
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Filtro de Marcas */}
          <div>
            <Autocomplete
              isClearable
              label="Marcas"
              placeholder="Seleccione Marca"
              onClear={() => handleFilterChange('brand', '')}
              onSelectionChange={(selectedKey) => handleFilterChange('brand', selectedKey || '')}
              selectedKey={filters.brand || null}
              defaultItems={brandOptions}
            >
              {(item) => (
                <AutocompleteItem key={item.value} value={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>

          {/* Filtro de Categorías */}
          <div>
            <Autocomplete
              isClearable
              label="Categorías"
              placeholder="Seleccione Categoría"
              onClear={() => handleFilterChange('category', '')}
              onSelectionChange={(selectedKey) => handleFilterChange('category', selectedKey || '')}
              selectedKey={filters.category || null}
              defaultItems={categoryOptions}
            >
              {(item) => (
                <AutocompleteItem key={item.value} value={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>

          {/* Filtro de Subcategorías */}
          <div>
            <Autocomplete
              isClearable
              label="Subcategorías"
              placeholder="Seleccione Subcategoría"
              onClear={() => handleFilterChange('subcategory', '')}
              onSelectionChange={(selectedKey) => handleFilterChange('subcategory', selectedKey || '')}
              selectedKey={filters.subcategory || null}
              defaultItems={subcategoryOptions}
            >
              {(item) => (
                <AutocompleteItem key={item.value} value={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>

          {/* Filtro de Período */}
          <div>
            <Select
              aria-label="Seleccione Período"
              label="Período"
              placeholder="Seleccione Período"
              selectedKeys={filters.period ? new Set([filters.period]) : new Set()}
              onSelectionChange={(selected) => {
                const selectedValue = selected.size > 0 ? Array.from(selected)[0] : '';
                handleFilterChange('period', selectedValue);
                setDateRange({
                  start: null,
                  end: null,
                });
              }}
            >
              <SelectItem key="daily" value="daily">Diario</SelectItem>
              <SelectItem key="weekly" value="weekly">Semanal</SelectItem>
              <SelectItem key="monthly" value="monthly">Mensual</SelectItem>
              <SelectItem key="yearly" value="yearly">Anual</SelectItem>
            </Select>
          </div>

          {/* Filtro de Fecha */}
          <div>
            <DateRangePicker
              label="Rango de Fechas"
              value={dateRange}
              onChange={handleDateChange}
              isDisabled={filters.period !== ''}
            />
          </div>

          {/* Filtro de Cliente */}
          <div>
            <Autocomplete
              isClearable
              label="Cliente"
              placeholder="Seleccione Cliente"
              onClear={() => handleFilterChange('customerId', '')}
              onSelectionChange={(selectedKey) => handleFilterChange('customerId', selectedKey || '')}
              selectedKey={filters.customerId || null}
              defaultItems={customerOptions}
            >
              {(item) => (
                <AutocompleteItem key={item.value} value={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>

        </div>
      </div>

      {/* Sección de Reports */}
      <div className="mb-6">
        <p><strong>Valor Promedio de Pedido:</strong> ${reports.averageOrderValue}</p>
        <p><strong>Total de Ventas:</strong> ${reports.totalSales}</p>
        <p><strong>Total de Pedidos:</strong> {reports.totalOrders} ventas</p>

        {/* Gráfico de Top Productos */}
        <div className="mt-4">
          <p className="text-lg font-bold">Top Productos:</p>
          {productNames.length > 0 ? (
            <Chart
              options={topProductsChartOptions}
              series={[{ data: productSales }]}
              type="bar"
              height={350}
            />
          ) : (
            <p>No hay datos disponibles para los Top Productos.</p>
          )}
        </div>
      </div>

      {/* Sección de Estadísticas de Clientes */}
      <div className="mt-6">
        {/* Gráfico de Top Clientes */}
        <div className="mt-6">
          <p className="text-lg font-bold">Top Clientes:</p>
          {customerNames.length > 0 ? (
            <Chart
              options={topCustomersChartOptions}
              series={[{ data: customerSpent }]}
              type="bar"
              height={350}
            />
          ) : (
            <p>No hay datos disponibles para los Top Clientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}
