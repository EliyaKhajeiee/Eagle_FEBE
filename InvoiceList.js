import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './InvoiceList.css';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedInvoices = Array.from(invoices);
    const [movedInvoice] = reorderedInvoices.splice(result.source.index, 1);
    reorderedInvoices.splice(result.destination.index, 0, movedInvoice);

    setInvoices(reorderedInvoices);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="invoice-list-container">
        <Droppable droppableId="droppable-invoices" direction="horizontal">
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
                      className="invoice-item"
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
    </DragDropContext>
  );
}

export default InvoiceList;
