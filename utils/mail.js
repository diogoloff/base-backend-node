const nodemailer = require("nodemailer");     

const emailConfig = {
    host: process.env.EMAIL_HOST, 
    port: process.env.EMAIL_PORT, 
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
};

const transporter = nodemailer.createTransport(emailConfig);

module.exports = {
    transporter, 
    sendEmail: async (subject, body, recipient) => {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM, 
            to: recipient, 
            subject: subject, 
            text: "", 
            html: body,
        });
    },

    emailCadastro: (link) => {
        return `<style>html,body { padding: 0; margin:0; }</style>
                <div style="font-family:Arial,Helvetica,sans-serif; line-height: 1.5; font-weight: normal; font-size: 15px; color: #2F3044; min-height: 100%; margin:0; padding:0; width:100%; background-color:#edf2f7">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 auto; padding:0; max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="center" style="text-align:center; padding: 40px">
                                    <a href="https://keenthemes.com" rel="noopener" target="_blank">
                                        <img alt="Logo" src="../../assets/media/logos/mail.svg" />
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" valign="center">
                                    <div style="text-align:left; margin: 0 20px; padding: 40px; background-color:#ffffff; border-radius: 6px">
                                        <!--begin:Email content-->
                                        <div style="padding-bottom: 30px; font-size: 17px;">
                                            <strong>Bem Vindo ao ${process.env.APP_NOME}!</strong>
                                        </div>
                                        <div style="padding-bottom: 30px">Para ativar sua conta, clique no botão abaixo para verificar seu endereço de e-mail. Uma vez ativado, você terá acesso a plataforma.</div>
                                        <div style="padding-bottom: 40px; text-align:center;">
                                            <a href="${link}" rel="noopener" style="text-decoration:none;display:inline-block;text-align:center;padding:0.75575rem 1.3rem;font-size:0.925rem;line-height:1.5;border-radius:0.35rem;color:#ffffff;background-color:#2986cc;border:0px;margin-right:0.75rem!important;font-weight:600!important;outline:none!important;vertical-align:middle" target="_blank">Ativar Conta</a>
                                        </div>
                                        <div style="border-bottom: 1px solid #eeeeee; margin: 15px 0"></div>
                                        <div style="padding-bottom: 50px; word-wrap: break-all;">
                                            <p style="margin-bottom: 10px;">Botão não funciona? Tente colar este URL no seu navegador:</p>
                                            <a href="${link}" rel="noopener" target="_blank" style="text-decoration:none;color: #2986cc">${link}</a>    
                                        </div>
                                        <!--end:Email content-->
                                        <div style="padding-bottom: 10px">Atenciosamente, <br>Equipe ${process.env.APP_NOME}.
                                            <tr>
                                                <td align="center" valign="center" style="font-size: 13px; text-align:center; padding: 20px; color: #6d6e7c;">
                                                    
                                                </td>
                                            </tr>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>`;
    },

    emailBoasVindas: (nome, link) => {
        return `<style>html,body { padding: 0; margin:0; }</style>
                <div style="font-family:Arial,Helvetica,sans-serif; line-height: 1.5; font-weight: normal; font-size: 15px; color: #2F3044; min-height: 100%; margin:0; padding:0; width:100%; background-color:#edf2f7">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 auto; padding:0; max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="center" style="text-align:center; padding: 40px">
                                    <a href="https://keenthemes.com" rel="noopener" target="_blank">
                                        <img alt="Logo" src="../../assets/media/logos/mail.svg" />
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" valign="center">
                                    <div style="text-align:left; margin: 0 20px; padding: 40px; background-color:#ffffff; border-radius: 6px">
                                        <!--begin:Email content-->
                                        <div style="padding-bottom: 30px; font-size: 17px;">
                                            <strong>Ola ${nome}!</strong>
                                            <strong>Bem Vindo ao ${process.env.APP_NOME}!</strong>
                                        </div>
                                        <div style="padding-bottom: 30px">Sua conta já esta ativada, agora você tem acesso a plataforma.</div>
                                        <div style="padding-bottom: 40px; text-align:center;">
                                            <a href="${link}" rel="noopener" style="text-decoration:none;display:inline-block;text-align:center;padding:0.75575rem 1.3rem;font-size:0.925rem;line-height:1.5;border-radius:0.35rem;color:#ffffff;background-color:#2986cc;border:0px;margin-right:0.75rem!important;font-weight:600!important;outline:none!important;vertical-align:middle" target="_blank">Entrar</a>
                                        </div>
                                        <div style="border-bottom: 1px solid #eeeeee; margin: 15px 0"></div>
                                        <div style="padding-bottom: 50px; word-wrap: break-all;">
                                            <p style="margin-bottom: 10px;">Botão não funciona? Tente colar este URL no seu navegador:</p>
                                            <a href="${link}" rel="noopener" target="_blank" style="text-decoration:none;color: #2986cc">${link}</a>    
                                        </div>
                                        <!--end:Email content-->
                                        <div style="padding-bottom: 10px">Atenciosamente, <br>Equipe ${process.env.APP_NOME}.
                                            <tr>
                                                <td align="center" valign="center" style="font-size: 13px; text-align:center; padding: 20px; color: #6d6e7c;">
                                                    
                                                </td>
                                            </tr>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>`;
    },

    emailRecuperarSenha: (nome, link) => {

        return `<style>html,body { padding: 0; margin:0; }</style>
                <div style="font-family:Arial,Helvetica,sans-serif; line-height: 1.5; font-weight: normal; font-size: 15px; color: #2F3044; min-height: 100%; margin:0; padding:0; width:100%; background-color:#edf2f7">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 auto; padding:0; max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="center" style="text-align:center; padding: 40px">
                                    <a href="https://keenthemes.com" rel="noopener" target="_blank">
                                        <img alt="Logo" src="/assets/media/logos/mail.svg" />
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" valign="center">
                                    <div style="text-align:left; margin: 0 20px; padding: 40px; background-color:#ffffff; border-radius: 6px">
                                        
                                        <!--begin:Email content-->
                                        <div style="padding-bottom: 30px; font-size: 17px;">
                                            <strong>Ola ${nome}!</strong>
                                        </div>
                                        <div style="padding-bottom: 30px">Você está recebendo este e-mail porque recebemos uma solicitação de redefinição de senha para sua conta. Para prosseguir com a redefinição de senha, clique no botão abaixo:</div>
                                        <div style="padding-bottom: 40px; text-align:center;">
                                            <a href="${link}" rel="noopener" style="text-decoration:none;display:inline-block;text-align:center;padding:0.75575rem 1.3rem;font-size:0.925rem;line-height:1.5;border-radius:0.35rem;color:#ffffff;background-color:#2986cc;border:0px;margin-right:0.75rem!important;font-weight:600!important;outline:none!important;vertical-align:middle" target="_blank">Resetar Senha</a>
                                        </div>
                                        <div style="padding-bottom: 30px">Este link de redefinição de senha expirará em 60 minutos. Se você não solicitou uma redefinição de senha, nenhuma outra ação será necessária.</div>
                                        <div style="border-bottom: 1px solid #eeeeee; margin: 15px 0"></div>
                                        <div style="padding-bottom: 50px; word-wrap: break-all;">
                                            <p style="margin-bottom: 10px;">Botão não funciona? Tente colar este URL no seu navegador:</p>
                                            <a href="${link}" rel="noopener" target="_blank" style="text-decoration:none;color: #2986cc">${link}</a>
                                        </div>
                                        <!--end:Email content-->
                                        <div style="padding-bottom: 10px">Atenciosamente, <br>Equipe ${process.env.APP_NOME}.
                                            <tr>
                                                <td align="center" valign="center" style="font-size: 13px; text-align:center; padding: 20px; color: #6d6e7c;">
                                                    
                                                </td>
                                            </tr>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>`;
    },

    emailSenhaAlterada: (nome) => {
        return `<style>html,body { padding: 0; margin:0; }</style>
                <div style="font-family:Arial,Helvetica,sans-serif; line-height: 1.5; font-weight: normal; font-size: 15px; color: #2F3044; min-height: 100%; margin:0; padding:0; width:100%; background-color:#edf2f7">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 auto; padding:0; max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="center" style="text-align:center; padding: 40px">
                                    <a href="https://keenthemes.com" rel="noopener" target="_blank">
                                        <img alt="Logo" src="/assets/media/logos/mail.svg" />
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" valign="center">
                                    <div style="text-align:left; margin: 0 20px; padding: 40px; background-color:#ffffff; border-radius: 6px">
                                        <!--begin:Email content-->
                                        <div style="padding-bottom: 30px; font-size: 17px;">
                                            <strong>Ola ${nome}!</strong>
                                        </div>
                                        <div style="padding-bottom: 20px">A sua senha de acesso ao ${process.env.APP_NOME} foi alterada.</div>
                                        <div style="padding-bottom: 40px">Se você não realizou esta alteração, contate nossa 
                                        <a href="#" rel="noopener" target="_blank" style="text-decoration:none;color: #2986cc; font-weight: bold">equipe de suporte</a>. Sua segurança é importante para nós!</div>
                                        <!--end:Email content-->
                                        <div style="padding-bottom: 10px">Atenciosamente, <br>Equipe ${process.env.APP_NOME}.
                                            <tr>
                                                <td align="center" valign="center" style="font-size: 13px; text-align:center; padding: 20px; color: #6d6e7c;">
                                                    
                                                </td>
                                            </tr>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>`
    }
}