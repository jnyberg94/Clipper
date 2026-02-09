<script>
  let {
    icon: IconComponent,
    variant = "white",
    size = "md",
    weight = "regular",
    class: className = "",
  } = $props();

  const sizes = {
    xxs: 12,
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
  };

  const colors = {
    white: "#000000",
    grey: "#666666",
    red: "#EE2C2C",
    blue: "#3A98FE",
    green: "#12B30D"
  };
</script>

<IconComponent
  size={sizes[size]}
  color={colors[variant]}
  {weight}
  class="icon {className}"
/>
