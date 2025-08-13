/* eslint-env node */
import { getDefaultConfig } from 'expo/metro-config';
import { withNativeWind } from 'nativewind/metro';

const config = getDefaultConfig(__dirname);

// @ts-expect-error: Metro config requires this line, workaround for missing types
module.exports = withNativeWind(config, { input: './global.css' });
