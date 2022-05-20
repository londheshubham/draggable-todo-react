import React, { useState } from 'react';
import './App.css';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import _ from "lodash";
import { v4 } from "uuid";

const item = {
  id: v4(),
  completedStatus: false,
  name: "Clean the house"
}

const item2 = {
  id: v4(),
  completedStatus: false,
  name: "Wash the car"
}

function App() {
  const [text, setText] = useState("")
  const [doneTaskIds, setDoneTaskIds] = useState([]);
  const [filter, setFilter] = useState('all');
  const [state, setState] = useState({
    "todo": {
      title: "Todo",
      items: [item, item2]
    }
  })
  const [checkedState, setCheckedState] = useState(
    new Array(state.todo.items.length).fill(false)
  );

  const handleDragEnd = ({ destination, source }) => {
    if (!destination) {
      return
    }

    if (destination.index === source.index && destination.droppableId === source.droppableId) {
      return
    }

    const itemCopy = { ...state[source.droppableId].items[source.index] }

    setState(prev => {
      prev = { ...prev }
      prev[source.droppableId].items.splice(source.index, 1)


      prev[destination.droppableId].items.splice(destination.index, 0, itemCopy)

      return prev
    })
  }

  const addItem = () => {
    setState(prev => {
      return {
        ...prev,
        todo: {
          title: "Todo",
          items: [
            {
              id: v4(),
              name: text
            },
            ...prev.todo.items
          ]
        }
      }
    })

    setText("")
  }

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
  }

  const markDone = (id, index) => {

    handleOnChange(index)
    let ids = [];
    if (!(doneTaskIds && doneTaskIds.includes(id))) {
      ids.push(id);
      setDoneTaskIds(...ids);
    }
    else {
      const index = ids.indexOf(id);
      if (index > -1) {
        ids.splice(index, 1);
      }

      setDoneTaskIds(...ids || []);
    }
  }

  const deleteItem = (id) => {
    const filteredItems = state.todo.items.filter(a => a.id !== id);
    setState({
      todo: {
        title: "Todo",
        items: [
          ...filteredItems
        ]
      }
    }
    )
  }

  const filterData = (filter) => {
    let dummyState = state.todo.items;
    switch (filter) {
      case 'all':
        setFilter('all');
        setState({
          todo: {
            title: "Todo",
            items: [
              ...dummyState
            ]
          }
        });
        break;
      case 'todo':
        setFilter('todo');
        dummyState = dummyState.filter(item => !doneTaskIds.includes(item.id));
        setState({
          todo: {
            title: "Todo",
            items: [
              ...dummyState
            ]
          }
        });
        break;
      case 'completed':
        setFilter('completed');
        dummyState = dummyState.filter(item => doneTaskIds.includes(item.id));
        setState({
          todo: {
            title: "Todo",
            items: [
              ...dummyState
            ]
          }
        });
        break;
      default:
        break;
    }

  }

  return (
    <div className="App">
      <div>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={addItem}>Add</button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        {_.map(state, (data, key) => {
          return (
            <div key={key} className={"column"}>
              <h3>{data.title}</h3>
              <Droppable droppableId={key}>
                {(provided, snapshot) => {
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={"droppable-col"}
                    >
                      {data.items.map((el, index) => {
                        return (
                          <Draggable key={el.id} index={index} draggableId={el.id}>
                            {(provided, snapshot) => {
                              console.log(snapshot)
                              return (
                                <div
                                  className={`item ${snapshot.isDragging && "dragging"}`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {doneTaskIds && doneTaskIds.includes(el.id) ? <div style={{ textDecoration: 'line-through' }}>{el.name}</div> : <div>{el.name}</div>}
                                  <input
                                    type="checkbox"
                                    id={`custom-checkbox-${index}`}
                                    checked={checkedState[index]}
                                    onChange={() => markDone(el.id, index)}
                                  />
                                  <button onClick={() => deleteItem(el.id)}>delete</button>
                                </div>
                              )
                            }}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )
                }}
              </Droppable>
            </div>
          )
        })}
      </DragDropContext>
      <div>
        <span className={`${filter === 'all' ? 'selected' : ''}`}
          onClick={() => filterData('all')}>All</span>
        <span className={`${filter === 'todo' ? 'selected' : ''}`}
          onClick={() => filterData('todo')}>todo</span>
        <span className={`${filter === 'completed' ? 'selected' : ''}`}
          onClick={() => filterData('completed')}>completed</span>
      </div>
    </div>
  );
}

export default App;
