<script>
  
  let { 
    icon: IconComponent,
    variant = 'white', 
    size = 'md',
    weight = 'regular',
    class: className = ''
  } = $props();

  const sizes = {
    xxs: 12,
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24
  };

  const colors = {
    dark: {
      white: '#ffffff',
      grey: '#808080',
      red: '#EE2C2C'
    },
    light: {
      white: '#000000',
      grey: '#666666',
      red: '#EE2C2C'
    }
  };

  // Derive the color based on current theme
  const iconColor = $derived(colors.dark[variant]);
</script>

<IconComponent 
  size={sizes[size]} 
  color={iconColor}
  {weight}
  class='icon {className}'
/>