import React, {useEffect, useState} from 'react';
import './homepage.scss';
import {getEvent, getWeeks, listOfEvents} from './utils'

const Homepage = () => {
    const [inputValue, setInputValue] = useState('');
    const [todoList, setTodoList] = useState([]);
    const [user, setUser] = useState();

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSendClick = async () => {
        if (inputValue.trim() !== '') {
            setTodoList([...todoList, {text: inputValue, checked: false}]);
            setInputValue('');

            await listOfEvents().then((events) => {
                const week = getWeeks(events);
                fetch('/scheduleTask', {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json'
                    }, body: JSON.stringify({user_id: user, task_name: inputValue, week})
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                    .then(data => {
                        const event = getEvent(data, user);
                        const request = window.gapi.client.calendar.events.insert({
                            'calendarId': 'primary', 'resource': event
                        });

                        request.execute(function (event) {

                        });
                    });
            }).catch((error) => {
                console.error(error);
            });
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendClick();
        }
    };

    const handleDeleteClick = (index) => {
        const newTodoList = [...todoList];
        newTodoList.splice(index, 1);
        setTodoList(newTodoList);
    };

    const handleCheckboxChange = (index) => {
        const newTodoList = [...todoList];
        const item = newTodoList.splice(index, 1)[0]; // Remove the item from the list
        item.checked = !item.checked; // Toggle the checked state
        if (item.checked) {
            // If the item is checked, move it to the top of the list
            newTodoList.unshift(item);
        } else {
            // If the item is unchecked, move it to its original position (end of the list)
            newTodoList.push(item);
        }
        setTodoList(newTodoList);
    };

    useEffect(() => {
        window.gapi.client.request({
            path: 'https://www.googleapis.com/oauth2/v2/userinfo'
        }).then(response => {
            const userInfo = response.result;
            setUser(userInfo.email);
            fetch(`/items/${userInfo.email}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setTodoList(data);
                })
                .catch(error => {
                    console.error(error);
                });
        });
    }, [])

    return <div className="homepage-container">
        <div className="todo-list">
            {todoList.map((item, index) => (<div className="todo-item" key={index}>
                <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleCheckboxChange(index)}
                />
                <span>{item.text}</span>
                {!item.checked && ( // Render delete button only if the item is not checked
                    <button className="delete-button" onClick={() => handleDeleteClick(index)}>
                        <img className="delete" src="https://svgshare.com/i/13bZ.svg" alt="delete"/>
                    </button>)}
            </div>))}
        </div>
        <div className="input-container">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="embark on your next adventure..."
            />
            <button onClick={handleSendClick}>
                <img className="send" src="https://svgshare.com/i/13bq.svg" alt="send"/>
            </button>
        </div>
    </div>;
};

export default Homepage;
