import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './DriverManager.css';

function DriverManager() {
  const [drivers, setDrivers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState(new Set()); // Track selected invoices

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/drivers')
      .then(response => response.json())
      .then(data => setDrivers(data))
      .catch(error => console.error('Error fetching drivers:', error));

    fetch('http://127.0.0.1:5000/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data))
      .catch(error => console.error('Error fetching invoices:', error));
  }, []);

  const onDragStart = (start) => {
    // Handle the start of a drag
    // If multiple selection is implemented, track selected items
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === 'invoices' && destination.droppableId.startsWith('driver')) {
      const draggedInvoice = invoices.find(inv => inv.id === draggableId);

      setDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.id === destination.droppableId
            ? { ...driver, invoices: [...driver.invoices, draggedInvoice] }
            : driver
        )
      );

      setInvoices(prevInvoices =>
        prevInvoices.filter(inv => inv.id !== draggableId)
      );

      // Clear selected invoices
      setSelectedInvoices(new Set());
    }
  };

  const handleInvoiceClick = (invoiceId) => {
    setSelectedInvoices(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(invoiceId)) {
        newSelected.delete(invoiceId);
      } else {
        newSelected.add(invoiceId);
      }
      return newSelected;
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="driver-manager-wrapper">
        {/* Invoice List */}
        {invoices.length > 0 && (
          <div className="invoice-list-container">
            <Droppable droppableId="invoices" direction="horizontal">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="invoice-list"
                >
                  {invoices.map((invoice, index) => (
                    <Draggable key={invoice.id} draggableId={String(invoice.id)} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`invoice-item ${selectedInvoices.has(invoice.id) ? 'selected' : ''}`}
                          onClick={() => handleInvoiceClick(invoice.id)}
                        >
                          {invoice.id}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        )}

        {/* Driver Profiles */}
        <div className="driver-profile-container">
          {drivers.map(driver => (
            <Droppable key={driver.id} droppableId={driver.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="driver-profile"
                >
                  <h3>{driver.name}</h3>
                  <p>{driver.van}</p>
                  <ul className="driver-invoice-list">
                    {driver.invoices.map((invoice, index) => (
                      <Draggable key={invoice.id} draggableId={String(invoice.id)} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="invoice-item"
                          >
                            {invoice.id}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}

export default DriverManager;
