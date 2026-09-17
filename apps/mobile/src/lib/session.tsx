import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { api, type User } from './api';

type SessionContextValue = { user: User | null; token: string | null; loading: boolean; login: (email: string, password: string, next?: string) => Promise<void>; register: (name: string, email: string, phone: string, password: string, next?: string) => Promise<void>; logout: () => Promise<void> };
const SessionContext = createContext<SessionContextValue | null>(null);
const TOKEN_KEY = 'minify_market_token';
const USER_KEY = 'minify_market_user';
async function save(key:string,value:string){if(Platform.OS==='web')localStorage.setItem(key,value);else await SecureStore.setItemAsync(key,value)}
async function read(key:string){if(Platform.OS==='web')return localStorage.getItem(key);return SecureStore.getItemAsync(key)}
async function remove(key:string){if(Platform.OS==='web')localStorage.removeItem(key);else await SecureStore.deleteItemAsync(key)}
function safeNext(next?:string){return next&&next.startsWith('/')&&!next.startsWith('//')?next:'/(tabs)'}
export function SessionProvider({children}:{children:React.ReactNode}){
 const[user,setUser]=useState<User|null>(null),[token,setToken]=useState<string|null>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{try{const[t,u]=await Promise.all([read(TOKEN_KEY),read(USER_KEY)]);if(t){setToken(t);globalThis.__MINIFY_TOKEN__=t}if(u)setUser(JSON.parse(u))}finally{setLoading(false)}})()},[]);
 const login=useCallback(async(email:string,password:string,next?:string)=>{const r=await api<{token:string;user:User}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});await save(TOKEN_KEY,r.token);await save(USER_KEY,JSON.stringify(r.user));globalThis.__MINIFY_TOKEN__=r.token;setToken(r.token);setUser(r.user);router.replace(safeNext(next) as any)},[]);
 const register=useCallback(async(name:string,email:string,phone:string,password:string,next?:string)=>{const r=await api<{token:string;user:User}>('/auth/register',{method:'POST',body:JSON.stringify({name,email,phone,password})});await save(TOKEN_KEY,r.token);await save(USER_KEY,JSON.stringify(r.user));globalThis.__MINIFY_TOKEN__=r.token;setToken(r.token);setUser(r.user);router.replace(safeNext(next) as any)},[]);
 const logout=useCallback(async()=>{await remove(TOKEN_KEY);await remove(USER_KEY);globalThis.__MINIFY_TOKEN__=undefined;setToken(null);setUser(null);router.replace('/(tabs)')},[]);
 const value=useMemo(()=>({user,token,loading,login,register,logout}),[user,token,loading,login,register,logout]);return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
export function useSession(){const value=useContext(SessionContext);if(!value)throw new Error('useSession must be used inside SessionProvider');return value}
