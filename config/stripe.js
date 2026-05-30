let stripeClient = null
let stripeLoadAttempted = false

export async function getStripe() {
  if (stripeLoadAttempted) return stripeClient
  stripeLoadAttempted = true

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is not set. Stripe checkout will be unavailable.')
    return null
  }

  try {
    const { default: Stripe } = await import('stripe')
    stripeClient = new Stripe(stripeSecretKey)
  } catch (error) {
    console.warn('Stripe package is not installed. Checkout will be unavailable until `stripe` is added to node_modules.')
    stripeClient = null
  }

  return stripeClient
}
