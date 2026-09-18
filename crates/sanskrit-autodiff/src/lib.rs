use serde::{Deserialize, Serialize};

/// Forward-Mode Automatic Differentiation via Dual Numbers
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Dual {
    pub val: f64,
    pub der: f64,
}

impl Dual {
    pub fn new(val: f64, der: f64) -> Self {
        Self { val, der }
    }

    pub fn var(val: f64) -> Self {
        Self { val, der: 1.0 }
    }

    pub fn constant(val: f64) -> Self {
        Self { val, der: 0.0 }
    }

    pub fn sin(self) -> Self {
        Self {
            val: self.val.sin(),
            der: self.der * self.val.cos(),
        }
    }

    pub fn cos(self) -> Self {
        Self {
            val: self.val.cos(),
            der: -self.der * self.val.sin(),
        }
    }

    pub fn exp(self) -> Self {
        let e = self.val.exp();
        Self {
            val: e,
            der: self.der * e,
        }
    }

    pub fn ln(self) -> Self {
        Self {
            val: self.val.ln(),
            der: self.der / self.val,
        }
    }

    pub fn powi(self, n: i32) -> Self {
        Self {
            val: self.val.powi(n),
            der: self.der * (n as f64) * self.val.powi(n - 1),
        }
    }
}

impl std::ops::Add for Dual {
    type Output = Self;
    fn add(self, rhs: Self) -> Self {
        Self {
            val: self.val + rhs.val,
            der: self.der + rhs.der,
        }
    }
}

impl std::ops::Sub for Dual {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self {
        Self {
            val: self.val - rhs.val,
            der: self.der - rhs.der,
        }
    }
}

impl std::ops::Mul for Dual {
    type Output = Self;
    fn mul(self, rhs: Self) -> Self {
        Self {
            val: self.val * rhs.val,
            der: self.der * rhs.val + self.val * rhs.der,
        }
    }
}

impl std::ops::Div for Dual {
    type Output = Self;
    fn div(self, rhs: Self) -> Self {
        Self {
            val: self.val / rhs.val,
            der: (self.der * rhs.val - self.val * rhs.der) / (rhs.val * rhs.val),
        }
    }
}

/// Helper to compute gradient of a scalar function f(x)
pub fn diff<F>(f: F, x: f64) -> f64
where
    F: Fn(Dual) -> Dual,
{
    f(Dual::var(x)).der
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_forward_ad_polynomial() {
        // f(x) = x^3 + 2*x^2 + 5
        // f'(x) = 3*x^2 + 4*x
        // At x = 2: f'(2) = 3*(4) + 4*(2) = 12 + 8 = 20
        let f = |x: Dual| x.powi(3) + Dual::constant(2.0) * x.powi(2) + Dual::constant(5.0);
        let grad = diff(f, 2.0);
        assert!((grad - 20.0).abs() < 1e-9);
    }
}
