# Sanfra Stock And Sips

Crie um sistema web completo e responsivo para uma adega de bairro em crescimento.

CONTEXTO DO NEGÓCIO

A plataforma será utilizada por uma adega de bairro que está em processo de crescimento e busca profissionalizar sua operação, melhorar o atendimento aos clientes, aumentar a recorrência de compras e tomar decisões baseadas em dados.

O sistema não deve ser apresentado como uma plataforma genérica de e-commerce. Ele deve transmitir a identidade de uma adega de bairro moderna, descontraída e tecnológica, mantendo uma aparência profissional.

A plataforma deverá possuir DUAS VISÕES PRINCIPAIS:

1. VISÃO DO CLIENTE/USUÁRIO

2. VISÃO ADMINISTRATIVA

==================================================

IDENTIDADE VISUAL

==================================================

Utilize como identidade principal:

- Preto: cor predominante

- Branco: textos, áreas de contraste e componentes

- Amarelo: utilizado apenas em detalhes, destaques, botões importantes, indicadores e elementos de atenção

A estética deve remeter levemente à identidade visual dos Simpsons, principalmente através do uso pontual do amarelo e de uma aparência descontraída, porém SEM copiar personagens, logos ou elementos protegidos da série.

O resultado deve parecer uma "adega urbana de bairro", com personalidade jovem, moderna e descontraída.

Evite excesso de amarelo.

Utilize:

- Fundo predominantemente preto ou tons muito escuros

- Cards brancos ou pretos

- Detalhes amarelos

- Bordas discretas

- Ícones modernos

- Tipografia moderna e legível

- Microinterações sutis

- Design responsivo para desktop, tablet e celular

==================================================

VISÃO DO CLIENTE

==================================================

Criar uma área pública e uma área autenticada para clientes.

PÁGINA INICIAL

A home deve apresentar:

- Nome/logo da adega

- Frase de impacto relacionada a uma adega de bairro em crescimento

- Botão "Fazer pedido"

- Botão "Ver promoções"

- Destaque para produtos e combos

- Produtos mais pedidos

- Promoções atuais

- Benefícios do programa de fidelidade

- Informações de entrega

- Horário de funcionamento

- Link para contato

Criar uma seção destacando:

"Do bairro para o seu rolê."

A comunicação deve transmitir proximidade, praticidade e confiança.

==================================================

CATÁLOGO DE PRODUTOS

==================================================

Criar catálogo com:

- Foto

- Nome

- Descrição

- Preço

- Categoria

- Promoção, quando houver

- Botão adicionar ao carrinho

Categorias de exemplo:

- Cervejas

- Destilados

- Vinhos

- Energéticos

- Refrigerantes

- Água

- Gelo

- Combos

- Outros

Criar filtros e busca.

O usuário deve conseguir adicionar produtos ao carrinho e alterar quantidades.

==================================================

DELIVERY PRÓPRIO

==================================================

Criar um sistema de pedidos próprio para reduzir filas e desorganização no atendimento.

Fluxo:

1. Cliente seleciona produtos

2. Adiciona ao carrinho

3. Informa endereço

4. Escolhe entrega ou retirada

5. Escolhe forma de pagamento

6. Confirma pedido

7. Recebe número do pedido

8. Acompanha status

Status:

- Pedido recebido

- Em preparação

- Pronto

- Saiu para entrega

- Entregue

- Cancelado

Criar uma tela de acompanhamento do pedido.

Mostrar previsão de entrega.

O objetivo é reduzir a dependência de pedidos desorganizados pelo WhatsApp e diminuir filas no estabelecimento.

==================================================

PROMOÇÕES

==================================================

Criar uma página exclusiva de promoções.

Cada promoção deve possuir:

- Produto ou combo

- Preço anterior

- Preço promocional

- Percentual de desconto

- Data de validade

- Quantidade disponível, quando aplicável

Criar banners e cards de promoções.

O administrador deverá conseguir criar, editar e remover promoções.

==================================================

FIDELIZAÇÃO

==================================================

Criar programa de fidelidade.

O cliente deve possuir uma área chamada:

"Minha Fidelidade"

Mostrar:

- Pontuação

- Número de compras

- Frequência de compra

- Benefícios disponíveis

- Cupons

- Descontos

- Histórico de compras

Criar níveis de fidelidade, por exemplo:

Cliente

VIP

Black

Quanto maior a frequência de compra, maiores os benefícios.

Exemplos:

- Desconto progressivo

- Cupons personalizados

- Ofertas exclusivas

- Frete diferenciado

- Benefícios especiais

Também criar uma funcionalidade para identificar clientes que estão há determinado período sem realizar compras.

Exemplo:

"Você não compra há 30 dias. Temos uma oferta especial para você."

==================================================

CONTROLE DE CLIENTES

==================================================

Na visão administrativa, permitir visualizar:

- Nome

- Telefone

- E-mail

- Endereço

- Quantidade de compras

- Valor total comprado

- Frequência de compra

- Última compra

- Nível de fidelidade

- Cupons utilizados

Criar filtros:

- Clientes ativos

- Clientes inativos

- Clientes VIP

- Clientes Black

- Clientes que compram frequentemente

- Clientes que não compram há 30/60/90 dias

==================================================

CONTROLE DE VALORES PENDENTES

==================================================

A plataforma deve permitir registrar valores pendentes associados aos clientes, quando houver compras não quitadas.

Mostrar:

- Cliente

- Pedido

- Data

- Valor

- Status

- Data de vencimento

Status:

- Pendente

- Pago

- Atrasado

Criar alertas visuais para valores atrasados.

IMPORTANTE:

Esse módulo deve ser tratado como controle interno administrativo, não como exposição pública da situação financeira do cliente.

==================================================

VISÃO ADMINISTRATIVA

==================================================

Criar um painel administrativo completo.

Dashboard principal:

Mostrar indicadores:

- Receita do dia

- Receita da semana

- Receita do mês

- Número de pedidos

- Ticket médio

- Clientes ativos

- Clientes novos

- Pedidos pendentes

- Pedidos em andamento

- Valores pendentes

Criar gráficos interativos.

==================================================

MÉTRICAS DE VENDAS

==================================================

O sistema deve levantar métricas para identificar os dias e horários de maior volume de vendas.

Criar visualizações como:

"Volume de pedidos por dia da semana"

Segunda

Terça

Quarta

Quinta

Sexta

Sábado

Domingo

E:

"Volume de pedidos por horário"

Exemplo:

08h–10h

10h–12h

12h–14h

14h–16h

16h–18h

18h–20h

20h–22h

22h–00h

Mostrar também:

- Receita por dia

- Receita por horário

- Quantidade de pedidos por horário

- Ticket médio por período

- Dia com maior faturamento

- Horário de maior movimento

Criar destaque automático:

"🔥 Sexta-feira entre 19h e 21h concentra o maior volume de pedidos."

Essas informações devem ajudar o administrador a tomar decisões operacionais.

==================================================

ANÁLISE DE HORÁRIOS DE PICO

==================================================

Criar uma seção chamada:

"Horários de Pico"

Mostrar visualmente os horários com maior movimento.

Utilizar heatmap ou gráfico de intensidade.

Exemplo:

          18h   19h   20h   21h

Seg       ░     ░     ▒     ░

Ter       ░     ▒     ▒     ░

Qua       ▒     ▒     ▓     ▒

Qui       ▒     ▓     ▓     ▒

Sex       ▓     █     █     ▓

Sáb       ▓     █     █     █

Dom       ▒     ▒     ▓     ▒

Utilizar amarelo apenas para destacar os períodos de maior intensidade.

==================================================

GESTÃO DE PEDIDOS

==================================================

Criar painel administrativo para pedidos.

Visualização em formato Kanban:

NOVOS

↓

EM PREPARAÇÃO

↓

PRONTOS

↓

SAIU PARA ENTREGA

↓

ENTREGUES

Cada pedido deve mostrar:

- Número

- Cliente

- Horário

- Produtos

- Valor

- Forma de pagamento

- Tipo: entrega/retirada

- Endereço, quando necessário

Permitir alterar o status do pedido.

==================================================

GESTÃO DE PROMOÇÕES

==================================================

Administrador poderá:

- Criar promoção

- Editar promoção

- Excluir promoção

- Definir período

- Definir desconto

- Selecionar produtos

- Criar combos

- Destacar promoção na página inicial

==================================================

FIDELIZAÇÃO ADMINISTRATIVA

==================================================

Criar painel para analisar:

- Clientes mais frequentes

- Clientes com maior ticket

- Clientes inativos

- Clientes novos

- Clientes VIP

- Clientes Black

Permitir criar campanhas segmentadas.

Exemplo:

"Enviar oferta para clientes que não compram há mais de 30 dias."

"Enviar promoção de cerveja para clientes que compram cerveja frequentemente."

==================================================

NOTIFICAÇÕES

==================================================

Criar estrutura visual para notificações.

Exemplos:

Para cliente:

"Seu pedido #1024 saiu para entrega."

"Você ganhou um cupom de R$ 10."

"Tem promoção nova na adega."

Para administrador:

"Existem 5 pedidos aguardando preparação."

"Hoje é o dia de maior movimento da semana."

"3 clientes VIP estão há mais de 30 dias sem comprar."

==================================================

NAVEGAÇÃO DO CLIENTE

==================================================

Menu:

Início

Produtos

Promoções

Meu Carrinho

Meus Pedidos

Minha Fidelidade

Perfil

==================================================

NAVEGAÇÃO DO ADMINISTRADOR

==================================================

Menu:

Dashboard

Pedidos

Clientes

Produtos

Promoções

Fidelidade

Valores Pendentes

Métricas

Horários de Pico

Configurações

==================================================

BANCO DE DADOS / ESTRUTURA

==================================================

Prepare a aplicação para possuir backend e banco de dados.

Criar entidades conceituais:

Users

Customers

Products

Categories

Orders

OrderItems

Payments

Promotions

Coupons

LoyaltyPoints

LoyaltyLevels

CustomerPurchases

PendingPayments

Notifications

DeliveryAddresses

Criar relacionamento adequado entre as entidades.

Não utilizar dados estáticos como solução definitiva.

Para demonstração inicial, utilizar dados mockados realistas, mas estruturar o código para futura integração com banco de dados.

==================================================

TECNOLOGIA E ARQUITETURA

==================================================

Construir como aplicação web moderna.

Priorizar:

- React

- TypeScript

- Componentização

- Responsividade

- Reutilização de componentes

- Estrutura organizada

- UX moderna

- Estados de loading

- Estados vazios

- Tratamento de erros

- Feedback visual para ações

Criar autenticação com dois perfis:

CUSTOMER

ADMIN

Usuários comuns não podem acessar as telas administrativas.

==================================================

EXPERIÊNCIA DO USUÁRIO

==================================================

A interface deve ser simples e rápida.

Priorizar:

- poucos cliques para realizar um pedido;

- informações importantes visualmente destacadas;

- navegação intuitiva;

- feedback imediato;

- layout mobile-first para a área do cliente;

- dashboard mais completo para desktop na área administrativa.

Não transformar o sistema em um painel corporativo genérico.

A identidade deve continuar sendo de uma ADEGA DE BAIRRO que está crescendo e utilizando tecnologia para organizar sua operação.

==================================================

OBJETIVO PRINCIPAL

==================================================

O sistema deve solucionar cinco problemas principais da adega:

1. Dificuldade de acompanhar o desempenho das vendas.

2. Desorganização e filas no atendimento e nos pedidos.

3. Dificuldade de divulgar promoções de forma eficiente.

4. Baixa recorrência e dificuldade de fidelizar clientes.

5. Falta de informações sobre dias e horários de maior movimento.

A plataforma deve utilizar tecnologia para transformar esses problemas em informações e processos organizados.

O resultado final deve parecer um produto real que poderia ser utilizado por uma adega de bairro em crescimento, e não apenas um protótipo acadêmico.



Use a imagem em anexo para a logo do site

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bec397c5-7f87-4374-9efb-6e26449f48bf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
