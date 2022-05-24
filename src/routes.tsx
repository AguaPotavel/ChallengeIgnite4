import React from 'react';
import { View, Text } from 'react-native';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from 'styled-components';


export default function Routes() {
    const theme = useTheme();

    return (
        <View style={{ backgroundColor: theme.colors.black, flex: 1 }}>
            <AnimatePresence exitBeforeEnter>
                <Text style={{color: 'white'}}>Routes</Text>
            </AnimatePresence>
        </View>
    );
}