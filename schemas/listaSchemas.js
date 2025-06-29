const Ajv = require("ajv/dist/2020")
const { trataErro, estaVazio } = require("../utils/generica");

const schemaUsuario = require('./usuario.json');

const ajv = new Ajv({removeAdditional: true});
const validarUsuario = ajv.compile(schemaUsuario);

/** Rotina para tratar os erros de schemas para ficar ao usuário mais amigavel.
* * Primeiro parâmetro recebe objeto de erros após validação do schema.
* * Segundo parâmetro indica se mostra o erro, digamos que seja uma API aberta, é ideal mostrar os erros, já API Fechada não
* neste caso o parâmetro não precisa ser informado. Em modo Debug sempre irá mostrar os erros.
*/
const trataErrosSchema = (erros, forcaEnvioMsg) => {
    // somente foi tratado alguns erros, porem aqui tem a documentação completa das keyworks
    // https://json-schema.org/draft/2020-12/json-schema-validation#name-maxitems

    let msg = 'JSON Inválido';

    if ((process.env.DEBUG === 'S') || (forcaEnvioMsg === true)) {
        for (const e of erros) {

            let propriedade = e.instancePath;
            let parametro = null;
            msg = e.message;

            if (e.params) {
                if (e.params.missingProperty) {
                    if (estaVazio(propriedade)) {
                        propriedade = e.params.missingProperty;       
                    } else {
                        propriedade = propriedade + '/' + e.params.missingProperty; 
                    }      
                }

                if (e.params.type) {
                    parametro = e.params.type;   
                }

                if (e.params.allowedValues) {
                    parametro = e.params.allowedValues;   
                }

                if (e.params.limit) {
                    parametro = e.params.limit;   
                }

                if (e.params.pattern) {
                    parametro = e.params.pattern;   
                }

                if (e.params.additionalProperty) {
                    parametro = e.params.additionalProperty;
                }
            }

            if (e.keyword === 'required') {
                msg = 'Propriedade "' + propriedade + '" não informada';
            } else if (e.keyword === 'type') {
                msg = 'Tipo da propriedade "' + propriedade + '" precisa ser "' + parametro + '"';
            } else if (e.keyword === 'enum') {
                msg = 'Propriedade "' + propriedade + '" precisa ser igual a um destes valores "' + parametro + '"';
            } else if (e.keyword === 'minLength') {
                msg = 'Propriedade "' + propriedade + '" precisa ter no minimo "' + parametro + '" caracteres';
            } else if (e.keyword === 'maxLength') {
                msg = 'Propriedade "' + propriedade + '" precisa ter no máximo "' + parametro + '" caracteres';
            } else if (e.keyword === 'pattern') {
                msg = 'Propriedade "' + propriedade + '" precisa respeitar o padrão "' + parametro + '"';
            } else if (e.keyword === 'additionalProperties') {
                msg = 'Propriedade "' + parametro + '" não faz parte do schema';
            }
        } 
    } 
    
    return trataErro('Falha na validação!', msg);
}

module.exports = {
    trataErrosSchema,
    validarUsuario
};
