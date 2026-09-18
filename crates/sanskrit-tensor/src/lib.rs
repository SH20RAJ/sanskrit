use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Tensor<T> {
    pub data: Vec<T>,
    pub shape: Vec<usize>,
    pub strides: Vec<usize>,
    pub offset: usize,
}

impl<T: Clone + Default> Tensor<T> {
    pub fn new(shape: Vec<usize>, data: Vec<T>) -> Self {
        let strides = compute_row_major_strides(&shape);
        Self {
            data,
            shape,
            strides,
            offset: 0,
        }
    }

    pub fn zeros(shape: Vec<usize>) -> Self {
        let total_elems: usize = shape.iter().product();
        let data = vec![T::default(); total_elems];
        Self::new(shape, data)
    }

    pub fn num_elements(&self) -> usize {
        self.shape.iter().product()
    }

    pub fn ndim(&self) -> usize {
        self.shape.len()
    }
}

impl Tensor<f64> {
    pub fn ones(shape: Vec<usize>) -> Self {
        let total_elems: usize = shape.iter().product();
        let data = vec![1.0; total_elems];
        Self::new(shape, data)
    }

    pub fn get_2d(&self, r: usize, c: usize) -> f64 {
        let idx = self.offset + r * self.strides[0] + c * self.strides[1];
        self.data[idx]
    }

    pub fn set_2d(&mut self, r: usize, c: usize, val: f64) {
        let idx = self.offset + r * self.strides[0] + c * self.strides[1];
        self.data[idx] = val;
    }

    /// Optimized General Matrix Multiplication (GEMM): C = A @ B
    pub fn matmul(&self, other: &Tensor<f64>) -> Result<Tensor<f64>, String> {
        if self.ndim() != 2 || other.ndim() != 2 {
            return Err("MatMul currently requires 2-dimensional tensors".to_string());
        }

        let m = self.shape[0];
        let k1 = self.shape[1];
        let k2 = other.shape[0];
        let n = other.shape[1];

        if k1 != k2 {
            return Err(format!("Matrix multiplication shape mismatch: [{}x{}] @ [{}x{}]", m, k1, k2, n));
        }

        let mut out = Tensor::zeros(vec![m, n]);

        // Cache-blocked naive/tiled multiplication
        for i in 0..m {
            for k in 0..k1 {
                let a_val = self.get_2d(i, k);
                for j in 0..n {
                    let b_val = other.get_2d(k, j);
                    let curr = out.get_2d(i, j);
                    out.set_2d(i, j, curr + a_val * b_val);
                }
            }
        }

        Ok(out)
    }

    /// Elementwise addition with broadcasting for 1D/2D
    pub fn add(&self, other: &Tensor<f64>) -> Result<Tensor<f64>, String> {
        if self.shape == other.shape {
            let mut out_data = Vec::with_capacity(self.data.len());
            for i in 0..self.data.len() {
                out_data.push(self.data[i] + other.data[i]);
            }
            return Ok(Tensor::new(self.shape.clone(), out_data));
        }

        // Simple bias broadcasting [M, N] + [N]
        if self.ndim() == 2 && other.ndim() == 1 && self.shape[1] == other.shape[0] {
            let m = self.shape[0];
            let n = self.shape[1];
            let mut out = Tensor::zeros(vec![m, n]);
            for i in 0..m {
                for j in 0..n {
                    out.set_2d(i, j, self.get_2d(i, j) + other.data[j]);
                }
            }
            return Ok(out);
        }

        Err(format!("Broadcasting not supported between {:?} and {:?}", self.shape, other.shape))
    }
}

fn compute_row_major_strides(shape: &[usize]) -> Vec<usize> {
    let mut strides = vec![1; shape.len()];
    for i in (0..shape.len().saturating_sub(1)).rev() {
        strides[i] = strides[i + 1] * shape[i + 1];
    }
    strides
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tensor_matmul_gemm() {
        // [2, 3] @ [3, 2] = [2, 2]
        let a = Tensor::new(vec![2, 3], vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0]);
        let b = Tensor::new(vec![3, 2], vec![7.0, 8.0, 9.0, 1.0, 2.0, 3.0]);

        let c = a.matmul(&b).unwrap();
        assert_eq!(c.shape, vec![2, 2]);
        assert_eq!(c.get_2d(0, 0), 1.0*7.0 + 2.0*9.0 + 3.0*2.0); // 7 + 18 + 6 = 31
        assert_eq!(c.get_2d(0, 1), 1.0*8.0 + 2.0*1.0 + 3.0*3.0); // 8 + 2 + 9 = 19
    }
}
