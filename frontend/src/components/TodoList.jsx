import React, { useState, useEffect } from 'react';
import { Box, Button, Input, List, ListItem, Text, VStack } from '@chakra-ui/react';
import io from 'socket.io-client';
import axios from 'axios';
import url from '../vars';

const uri = url;
const socket = io(`${uri}`); 

const TodoList = ({ token }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${uri}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();

    socket.on('taskAdded', (task) => {
      setTasks((prevTasks) => [...prevTasks, task]);
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    });

    socket.on('taskDeleted', (deletedTask) => {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== deletedTask.id)
      );
    });

    return () => {
      socket.off('taskAdded');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, [token]);

  const addTask = async () => {
    if (!newTask) return;

    try {
      const res = await axios.post(
        `${uri}/tasks`,
        { name: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTaskStatus = async (id) => {
    const task = tasks.find(t => t.id === id);
    const statusOrder = ['pending', 'in-progress', 'complete'];
    const currentStatusIndex = statusOrder.indexOf(task.status);
    const newStatus = statusOrder[(currentStatusIndex + 1) % statusOrder.length];

    try {
      await axios.put(
        `${uri}/tasks/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${uri}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusButtonColor = (status) => {
    switch (status) {
      case 'pending':
        return 'red.300'; 
      case 'in-progress':
        return 'yellow.300'; 
      case 'complete':
        return 'green.300'; 
      default:
        return 'gray.300'; 
    }
  };

  return (
    <Box>
      <Text mb={4} fontSize="2xl">Todo List</Text>
      <Input
        placeholder="Add new task"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        mb={4}
      />
      <Button onClick={addTask} mb={4}>Add Task</Button>
      <List spacing={3}>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            mb={2}
            p={4}
            borderRadius="md"
            bg="gray.100" 
            color="black" 
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <VStack spacing={2} align="start" flex="1">
              <Text fontWeight={800}>{task.name}</Text>
              <Button
                onClick={() => updateTaskStatus(task.id)}
                bg={getStatusButtonColor(task.status)}
                color="black" 
                variant="solid"
              >
                {task.status === 'complete' ? 'Complete' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
              </Button>
            </VStack>
            <Button textColor={'black'} onClick={() => deleteTask(task.id)} bg="red" ml={4}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TodoList;
