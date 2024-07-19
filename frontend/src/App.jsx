import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { Box, Button, Flex, Spacer, Text } from '@chakra-ui/react';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import axios from 'axios';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setShowLoginMessage(false); 
    } else {
      localStorage.removeItem('token');
      setShowLoginMessage(true); 
    }
  }, [token]);

  const handleLogout = () => {
    setToken('');
  };

  return (
    <Box p={4}>
      {showLoginMessage && !token && (
        <Box mb={4} p={3} borderRadius="md" bg="yellow.100" color="black" textAlign="center">
          Please log in to use the ToDo application.
        </Box>
      )}
      <Flex mb={4}>
        <Text fontSize="2xl" as="b">ToDo App</Text>
        <Spacer />
        {token ? (
          <>
            <Button as={Link} to="/todos" mr={4}>Todo List</Button>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Button as={Link} to="/login" mr={4}>Login</Button>
            <Button as={Link} to="/register">Register</Button>
          </>
        )}
      </Flex>
      
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/todos" /> : <Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={token ? <TodoList token={token} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/todos" : "/login"} />} />
      </Routes>
    </Box>
  );
};

export default App;
