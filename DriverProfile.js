import React from 'react';
import './DriverProfile.css';
import { Droppable, Draggable } from 'react-beautiful-dnd';

function DriverProfile({ drivers }) {
  return (
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
                        {invoice.content}
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
  );
}

export default DriverProfile;
