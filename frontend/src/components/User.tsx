'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'

type User = {
  _id: string;
  name: string;
  email: string;
}

type SelectedUser = User | null;

const GET_USERS = gql`
  query {
    users {
      _id
      name
      email
    }
  }
`

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      _id
      name
      email
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      _id
      name
      email
    }
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      deletedUserId
    }
  }
`

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<SelectedUser>(null)
  const { loading, error, data, refetch } = useQuery(GET_USERS)
  const [createUser] = useMutation(CREATE_USER)
  const [updateUser] = useMutation(UPDATE_USER)
  const [deleteUser] = useMutation(DELETE_USER)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser({
        variables: {
          input: { name, email, password }
        }
      })
      refetch()
      setName('')
      setEmail('')
      setPassword('')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      await updateUser({
        variables: {
          id: selectedUser._id,
          input: { name, email, password }
        }
      })
      refetch()
      setSelectedUser(null)
      setName('')
      setEmail('')
      setPassword('')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUser({
        variables: { id }
      })
      refetch()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const storedUserId = localStorage.getItem('userId')

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="container mx-auto p-4">
        <div className="mb-8">
        <center>
            <img
            src="/users.svg"
            alt="Users Management"
            style={{ width: '50%' }}
            />
            <h1 className="text-2xl font-bold mb-4 mt-4">User Management</h1>
        </center>
      </div>
      
      <button
        onClick={() => {
          setSelectedUser(null)
          setName('')
          setEmail('')
          setPassword('')
          setIsModalOpen(true)
        }}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add New User
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{selectedUser ? 'Update User' : 'Create New User'}</h3>
            <form onSubmit={selectedUser ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {selectedUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user: User) => (
            <tr key={user._id}>
              <td className="py-2 px-4 border-b border-gray-200">{user.name}</td>
              <td className="py-2 px-4 border-b border-gray-200">{user.email}</td>
              <td className="py-2 px-4 border-b border-gray-200">
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  onClick={() => {
                    setSelectedUser(user)
                    setName(user.name)
                    setEmail(user.email)
                    setPassword('')
                    setIsModalOpen(true)
                  }}
                >
                  Edit
                </button>
                {user._id !== storedUserId && (
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

