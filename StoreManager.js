import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './StoreManager.css';

function StoreManager() {
  const [stores, setStores] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [droppedStores, setDroppedStores] = useState(new Set()); // Track dropped stores
  const [showModal, setShowModal] = useState(false); // Added line: State for showing/hiding the modal

  useEffect(() => {
    // Fetch stores and drivers
    fetch('http://127.0.0.1:5000/api/stores')
      .then(response => response.json())
      .then(data => setStores(data))
      .catch(error => console.error('Error fetching stores:', error));

    fetch('http://127.0.0.1:5000/api/drivers')
      .then(response => response.json())
      .then(data => setDrivers(data))
      .catch(error => console.error('Error fetching drivers:', error));
  }, []);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return; // Dropped outside a droppable area

    if (source.droppableId === 'storeList' && destination.droppableId.startsWith('driver')) {
      // Moving a store from the store list to a driver
      const draggedStore = stores.find(store => store.id === draggableId);
      const updatedStores = stores.filter(store => store.id !== draggableId);

      setDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.id === destination.droppableId
            ? { ...driver, stores: [...driver.stores, draggedStore] }
            : driver
        )
      );

      setStores(updatedStores);
      setDroppedStores(prev => new Set(prev).add(draggableId)); // Mark as dropped
    } else if (source.droppableId.startsWith('driver') && destination.droppableId.startsWith('driver')) {
      // Moving a store between drivers
      const sourceDriver = drivers.find(driver => driver.id === source.droppableId);
      const destinationDriver = drivers.find(driver => driver.id === destination.droppableId);

      const draggedStore = sourceDriver.stores[source.index];
      const updatedSourceStores = [...sourceDriver.stores];
      updatedSourceStores.splice(source.index, 1);

      const updatedDestinationStores = [...destinationDriver.stores];
      updatedDestinationStores.splice(destination.index, 0, draggedStore);

      setDrivers(prevDrivers =>
        prevDrivers.map(driver => {
          if (driver.id === source.droppableId) {
            return { ...driver, stores: updatedSourceStores };
          } else if (driver.id === destination.droppableId) {
            return { ...driver, stores: updatedDestinationStores };
          } else {
            return driver;
          }
        })
      );
    } else if (source.droppableId.startsWith('driver') && destination.droppableId === 'storeList') {
      // Moving a store back from a driver to the store list
      const sourceDriver = drivers.find(driver => driver.id === source.droppableId);
      const draggedStore = sourceDriver.stores[source.index];
      const updatedSourceStores = [...sourceDriver.stores];
      updatedSourceStores.splice(source.index, 1);

      setStores(prevStores => [...prevStores, draggedStore]);

      setDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.id === source.droppableId
            ? { ...driver, stores: updatedSourceStores }
            : driver
        )
      );

      setDroppedStores(prev => {
        const newSet = new Set(prev);
        newSet.delete(draggableId); // Remove from dropped stores set
        return newSet;
      });
    }
  };

  const openModal = () => { // Added function for showing modal
    setShowModal(true);
  };

  const closeModal = () => { // Added function for closing modal
    setShowModal(false);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="store-manager-wrapper">
        {/* Left Side: Store List */}
        <Droppable droppableId="storeList" direction="vertical">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="store-list-container"
            >
              <h2>Stores</h2>
              {stores.map((store, index) => (
                <Draggable key={store.id} draggableId={store.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`store-container ${droppedStores.has(store.id) ? 'dropped' : 'initial'}`}
                    >
                      <h3>{store.name}</h3>
                      <ul className="invoice-list">
                        {store.invoices.map((invoice) => (
                          <li key={invoice.id} className="invoice-item">
                            Invoice ID: {invoice.id}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Right Side: Driver Areas */}
        <div className="drivers-container">
          {drivers.map((driver) => (
            <Droppable key={driver.id} droppableId={driver.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="driver-container"
                >
                  {/* Driver Header with Image */}
                  <div className="driver-header">
                    <img
                      src={driver.imageUrl || 'https://via.placeholder.com/60'} // Fallback image
                      alt={driver.name}
                      className="driver-image"
                    />
                    <div>
                      <h2>{driver.name}</h2>
                      <div className="driver-van">Van: {driver.van}</div>
                    </div>
                  </div>

                  <ul className="driver-store-list">
                    {driver.stores.map((store, index) => (
                      <Draggable key={store.id} draggableId={store.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="store-item"
                          >
                            <div className="store-name">{store.name}</div>
                            <ul className="driver-invoice-list">
                              {store.invoices.map((invoice) => (
                                <li key={invoice.id} className="invoice-item">
                                  Invoice ID: {invoice.id}
                                </li>
                              ))}
                            </ul>
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

        {}
        <button className="open-modal-button" onClick={openModal}>
          Open Modal
        </button>

        {/* MODAL TOOKI */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>
                &times;
              </span>
              <h2>New Page</h2>
              <p>This is a new page that can be exited out of.</p>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}

export default StoreManager;
