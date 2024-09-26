import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
  Image,
  Button,
  Tooltip
} from "@nextui-org/react";
import {
  IconEdit,
  IconTrash
} from '@tabler/icons-react';

const VariantsTable = ({ variants, loading, error, productName, onDeleteVariant, onEditVariant }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-6">
        {error}
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="text-center p-6">
        No hay variantes para este producto.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto overflow-x-auto max-h-72">
      <Table
        aria-label={`Variantes de ${productName}`}
        className="border-1 rounded-md min-w-full"
        shadow="none"
        isCompact
        removeWrapper
      >
        <TableHeader columns={[
          { key: 'image', label: 'Imagen', sortable: false },
          { key: 'color', label: 'Color', sortable: true },
          { key: 'size', label: 'Talle', sortable: true },
          { key: 'stock', label: 'Stock', sortable: true },
          { key: "actions", label: "Acciones", sortable: false }
        ]}>
          {(column) => (
            <TableColumn
              key={column.key}
              className="bg-white text-bold border-b-1"
              isSortable={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={variants}>
          {(variant) => (
            <TableRow key={variant.id}>
              {(columnKey) => (
                <TableCell>
                  {columnKey === 'image' ? (
                    <Image src={variant.image} alt={`${variant.color} ${variant.size}`} className="w-16 h-16 object-cover rounded" />
                  ) : columnKey === 'stock' ? (
                    variant.stock
                  ) : columnKey === 'actions' ? (
                    <div className="flex items-center gap-1">
                      <Tooltip content="Editar">
                        <Button
                          variant="light"
                          className="rounded-md"
                          isIconOnly
                          color="warning"
                          onPress={() => onEditVariant(variant)}
                          aria-label={`Editar variante ${variant.color} ${variant.size}`}
                        >
                          <IconEdit className="h-5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Eliminar">
                        <Button
                          variant="light"
                          className="rounded-md"
                          isIconOnly
                          color="danger"
                          onPress={() => onDeleteVariant(variant)}
                          aria-label={`Eliminar variante ${variant.color} ${variant.size}`}
                        >
                          <IconTrash className="h-5" />
                        </Button>
                      </Tooltip>
                    </div>
                  ) : (
                    variant[columnKey]
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VariantsTable;
