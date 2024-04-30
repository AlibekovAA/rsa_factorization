from math import gcd
from random import randint


def is_fermat_probable_prime(number: int):
    if number <= 16:
        return number in (2, 3, 5, 7, 11, 13)
    for _ in range(150):
        if pow(randint(2, number - 2), number - 1, number) != 1:
            return False
    return True


def factorize_number(num: int):
    factors_list = []
    i = 2
    while i * i <= num:
        if num % i == 0:
            factors_list.append(i)
            num //= i
        else:
            i += 1
    if num > 1:
        factors_list.append(num)
    return factors_list


class Factorization:
    def pollard_rho_factor(self, n: int):
        if n <= 10000:
            return factorize_number(n)
        else:
            if n <= 1:
                return []
            if is_fermat_probable_prime(n):
                return [n]

            x = 2
            y = 2
            d = 1
            while d == 1:
                x = (x * x + 1) % n
                y = (y * y + 1) % n
                y = (y * y + 1) % n
                d = gcd(abs(x - y), n)
                if d != 1:
                    if d == n:
                        return [n]
                    else:
                        if is_fermat_probable_prime(d):
                            factors = [d]
                        else:
                            factors = factorize_number(d)
                        factors.extend(self.pollard_rho_factor(n // d))
                        return factors

            return [n]
