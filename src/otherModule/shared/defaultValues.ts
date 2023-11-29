export class ConstValue{
    private FIND_OUT:boolean = true
    private NOT_FOUND:boolean = false
    private SUCCESS:boolean = true
    private FAIL:boolean = false
    private NOT_EXISTED:boolean = false
    private EXISTED:boolean = true
    private INVALID:boolean = false
    private VALID:boolean = true
  
    public FindOut():boolean{
      return this.FIND_OUT
    }
    public NotFound():boolean{
      return this.NOT_FOUND
    }
    public Success():boolean{
      return this.SUCCESS
    }
    public Fail():boolean{
      return this.FAIL
    }
    public Existed():boolean{
      return this.EXISTED
    }
    public NotExisted():boolean{
      return this.NOT_EXISTED
    }
    public Invalid():boolean{
      return this.INVALID
    }
    public Valid():boolean{
      return this.VALID
    }
    
  }