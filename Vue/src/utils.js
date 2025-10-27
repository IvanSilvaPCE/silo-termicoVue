// Removido import de 'jwt-decode' e adicionado decoder local
function jwtDecode(token) {
  try {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Decodifica Base64 com padding
    const padded = b64 + '==='.slice((b64.length + 3) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export function verificarPerfilOperacao(cdParametros) {
   const token = localStorage.getItem('token') || null
   const decodedToken = jwtDecode(token)

   if (decodedToken && decodedToken.user && decodedToken.user.usuarios_perfis) {
      const perfilOuOperacaoEncontrado = decodedToken.user.usuarios_perfis.some((perfil) => {
         if (cdParametros.some(cdParametro => perfil.cd_perfil === cdParametro)) {
            return true
         }
         return perfil.transacoes.some((transacao) =>
            transacao.operacoes.some((op) =>
               cdParametros.some(cdParametro => op.cd_transacao_operacao === cdParametro)
            )
         )
      })
      return perfilOuOperacaoEncontrado
   }
   return false
}