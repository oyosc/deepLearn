
extern double Lots=0.01;
extern bool   MoneyManage=True;
//+------------------------------------------------------------------+
void OnTick()
  {
   int Ticket,Action;
   if(MoneyManage==True)
     {
      Lots=(AccountEquity()*2/10000);
     }
   if(OrdersTotal()==0)
     {
      if(Action==1)
        {
         Ticket=OrderSend(Symbol(),OP_BUY,Lots,Ask,3,0,0,"DLEA",6,0,Green);
         if(Ticket<=0) Print("Buy Order Open Error: ",GetLastError());
         return;
        }
      if(Action==1)
        {
         Ticket=OrderSend(Symbol(),OP_SELL,Lots,Bid,3,0,0,"DLEA",9,0,Red);
         if(Ticket<=0) Print("Sell Order Open Error: ",GetLastError());
         return;
        }
     }
   if(OrdersTotal()==1)
     {
      Ticket=OrderSelect(0,SELECT_BY_POS);
      if(OrderSymbol()==Symbol() && OrderType()==OP_BUY && Action==-1)
        {
         Ticket=OrderClose(OrderTicket(),OrderLots(),Bid,3,Green);
         if(Ticket<=0) Print("Buy Order Close Error: ",GetLastError());
         return;
        }
      if(OrderSymbol()==Symbol() && OrderType()==OP_SELL && Action==1)
        {
         Ticket=OrderClose(OrderTicket(),OrderLots(),Ask,3,Red);
         if(Ticket<=0) Print("Sell Order Close Error: ",GetLastError());
         return;
        }
     }
   return;
  }
//+------------------------------------------------------------------+
