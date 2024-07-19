import React, { useState } from 'react';
import { Box, Button, Input, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import axios from 'axios';
import url from '../vars';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const uri = url;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Both username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${uri}/login`, { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    } catch (error) {
      console.error(error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text mb={4} fontSize="2xl">Login</Text>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          mb={4}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb={4}
        />
        <Button type="submit" isDisabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Login'}
        </Button>
      </form>
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Login;
