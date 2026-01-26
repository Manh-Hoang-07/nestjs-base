export function safeUser<T extends { password?: any; remember_token?: any }>(user: T) {
  const { password, remember_token, ...rest } = user as any;
  return rest as Omit<T, 'password' | 'remember_token'>;
}



