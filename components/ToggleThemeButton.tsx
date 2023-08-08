import { ActionIcon, useMantineColorScheme } from '@mantine/core'
import { IconMoonStars, IconSun } from '@tabler/icons-react'
import React from 'react'

export const ToggleThemeButton: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <ActionIcon
      color={colorScheme === 'dark' ? 'yellow' : 'blue'}
      title="テーマを切り替える"
      variant="outline"
      onClick={() => {
        toggleColorScheme()
      }}
    >
      {colorScheme === 'dark' ? (
        <IconSun size={18} />
      ) : (
        <IconMoonStars size={18} />
      )}
    </ActionIcon>
  )
}
