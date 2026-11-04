/**
 * hooks.js — thin wrappers around react-redux hooks so components import from one place.
 * (Plain JS project — no TS types, but keeps a single import surface.)
 */
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
