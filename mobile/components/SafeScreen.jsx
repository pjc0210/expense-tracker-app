import { View } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {COLORS} from "@/constants/colors.js"

const SafeScreen = ({ children }) => {
    const insets = useSafeAreaInsets();
  return (
    <View style={{paddingTop:insets.top, paddingBottom:insets.bottom, flex:1,
                paddingLeft:insets.left, paddingRight:insets.right,
                backgroundColor: COLORS.background}}>
      {children}
    </View>
  )
}

export default SafeScreen